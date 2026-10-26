<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use App\Services\OrderInvoiceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SellerInvoiceController extends Controller
{
    protected OrderInvoiceService $invoiceService;

    public function __construct(OrderInvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
    }

    /**
     * Display seller invoices page.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $store = $user->store;

        if (!$store) {
            return Inertia::render('Seller/Invoices/Index', [
                'invoices' => [
                    'data' => [],
                    'links' => [],
                ],
                'stats' => [
                    'total_invoices' => 0,
                    'total_amount' => 0,
                    'paid_count' => 0,
                    'pending_count' => 0,
                    'pending_amount' => 0,
                ],
                'filters' => [
                    'search' => '',
                    'status' => 'all',
                ],
            ]);
        }

        $query = Order::with(['items', 'store.user'])
            ->where('store_id', $store->id);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('tracking_code', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        $groups = ['paid' => ['paid', 'in_delivery', 'delivered'], 'pending' => ['pending'], 'cancelled' => ['cancelled', 'failed']];
        $statusFilter = $request->input('status', 'all');
        if (isset($groups[$statusFilter])) {
            $query->whereIn('status', $groups[$statusFilter]);
        }
        if ($request->input('source') === 'manual') {
            $query->where('is_manual', true);
        } elseif ($request->input('source') === 'online') {
            $query->where('is_manual', false);
        }
        // Une facture n'existe que si elle est manuelle ou payée : les commandes en ligne impayées n'en sont pas
        $query->where(fn ($q) => $q->where('is_manual', true)->orWhereNotNull('invoice_number')->orWhereIn('status', ['paid', 'in_delivery', 'delivered']));

        $invoices = $query->latest()->paginate(12)->withQueryString();

        $allOrders = Order::where('store_id', $store->id)->get();

        $paidOrders = $allOrders->filter(function ($o) {
            return in_array($o->status, ['paid', 'PAID', 'in_delivery', 'delivered']);
        });

        $onlinePaidOrders = $paidOrders->filter(fn($o) => !$o->is_manual);
        $manualPaidOrders = $paidOrders->filter(fn($o) => $o->is_manual);

        // À encaisser : factures manuelles émises mais pas encore réglées
        $pendingOrders = $allOrders->filter(fn ($o) => $o->is_manual && $o->status === 'pending');

        $stats = [
            'total_invoices' => $paidOrders->count() + $pendingOrders->count(),
            'total_amount' => (float) $paidOrders->sum('price_vendor'),
            'paid_count' => $paidOrders->count(),
            'online_paid_count' => $onlinePaidOrders->count(),
            'online_paid_amount' => (float) $onlinePaidOrders->sum('price_vendor'),
            'manual_paid_count' => $manualPaidOrders->count(),
            'manual_paid_amount' => (float) $manualPaidOrders->sum('price_vendor'),
            'pending_count' => $pendingOrders->count(),
            'pending_amount' => (float) $pendingOrders->sum('price_vendor'),
        ];

        return Inertia::render('Seller/Invoices/Index', [
            'store' => $store,
            'invoices' => $invoices,
            'stats' => $stats,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'all'),
                'source' => $request->input('source', 'all'),
            ],
            'appUrl' => request()->getSchemeAndHttpHost() ?: config('app.url', 'http://localhost:8000'),
        ]);
    }

    /**
     * Crée une facture manuelle (vente hors boutique en ligne : magasin, WhatsApp, commande spéciale…).
     */
    public function storeManualInvoice(Request $request): RedirectResponse
    {
        $store = Auth::user()->store;
        abort_unless($store, 403);

        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:50'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'customer_city' => ['nullable', 'string', 'max:120'],
            'delivery_address' => ['nullable', 'string', 'max:500'],
            'items' => ['required', 'array', 'min:1', 'max:30'],
            'items.*.description' => ['required', 'string', 'max:255'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:10000'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'due_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'mark_paid' => ['nullable', 'boolean'],
        ]);

        $total = collect($validated['items'])->sum(fn ($it) => $it['quantity'] * $it['unit_price']);
        if ($total < 100) {
            return back()->withErrors(['items' => 'Le total de la facture doit être d’au moins 100 FCFA.']);
        }

        $customer = Customer::firstOrNew(['phone' => $validated['customer_phone']]);
        $customer->name = $validated['customer_name'];
        if (! empty($validated['customer_email'])) {
            $customer->email = $validated['customer_email'];
        }
        $customer->city = ($validated['customer_city'] ?? null) ?: ($customer->city ?: null);
        $customer->delivery_address = ($validated['delivery_address'] ?? null) ?: $customer->delivery_address;
        $customer->save();

        $paid = (bool) ($validated['mark_paid'] ?? false);

        $order = DB::transaction(function () use ($store, $customer, $validated, $total, $paid) {
            $order = Order::create([
                'tracking_code' => 'BLK-FAC-'.strtoupper(Str::random(8)),
                'store_id' => $store->id,
                'customer_id' => $customer->id,
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'customer_email' => $validated['customer_email'] ?? null,
                'city' => $customer->city,
                'address_details' => $validated['delivery_address'] ?? null,
                'price_vendor' => $total,
                'saas_margin' => 0,
                'api_fee' => 0,
                'total_client' => $total,
                'status' => $paid ? 'paid' : 'pending',
                'is_manual' => true,
                'payment_status' => $paid ? 'paid' : 'pending',
                'paid_at' => $paid ? now() : null,
                'payment_phone' => $validated['customer_phone'],
                'invoice_due_at' => $validated['due_at'] ?? null,
                'invoice_notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $order->items()->create([
                    'product_id' => null,
                    'product_title' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price_vendor' => $item['unit_price'],
                    'total_price_vendor' => $item['quantity'] * $item['unit_price'],
                ]);
            }

            return $order;
        });

        if (! empty($validated['customer_email'])) {
            try {
                $this->invoiceService->sendOrderInvoiceEmails($order);
            } catch (\Exception $e) {
                // L'envoi d'e-mail est facultatif
            }
        }

        return redirect()->back()->with('message', "Facture {$order->invoice_number} créée.");
    }

    /**
     * Statut de paiement d'une facture manuelle. Les ventes en ligne suivent la confirmation de l'opérateur.
     */
    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $store = Auth::user()->store;
        abort_unless($store && $order->store_id === $store->id, 403);

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,paid,cancelled'],
        ]);

        if (! $order->is_manual) {
            return back()->withErrors(['status' => 'Le paiement des ventes en ligne est confirmé automatiquement par l’opérateur Mobile Money.']);
        }

        $status = $validated['status'];
        $order->update([
            'status' => $status,
            'payment_status' => match ($status) { 'paid' => 'paid', 'cancelled' => 'failed', default => 'pending' },
            'paid_at' => $status === 'paid' ? ($order->paid_at ?? now()) : null,
        ]);

        $label = ['paid' => 'marquée payée', 'cancelled' => 'annulée', 'pending' => 'remise en attente'][$status];

        return redirect()->back()->with('message', "Facture {$order->invoice_number} {$label}.");
    }

    /**
     * Send email/whatsapp reminder for pending invoice.
     */
    public function sendReminder(Request $request, Order $order): RedirectResponse
    {
        $user = Auth::user();
        if (!$user->store || $order->store_id !== $user->store->id) {
            abort(403);
        }

        // 1. Send WhatsApp 1-Click Reminder
        $whatsappSuccess = false;
        try {
            $res = app(\App\Services\WhatsappGatewayService::class)->send1ClickReminder($order);
            $whatsappSuccess = $res['success'] ?? false;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('WhatsApp 1-Click reminder failed', ['order_id' => $order->id, 'err' => $e->getMessage()]);
        }

        // 2. Send Email Reminder (backup if email provided)
        if ($order->customer_email) {
            try {
                $this->invoiceService->sendOrderInvoiceEmails($order);
            } catch (\Exception $e) {
                // Ignore
            }
        }

        $msg = $whatsappSuccess 
            ? "Relance WhatsApp envoyée avec succès au client ({$order->customer_phone}) !" 
            : "Relance effectuée avec succès au client !";

        return redirect()->back()->with('message', $msg);
    }


    /**
     * Download PDF invoice for an order.
     */
    public function download(Order $order)
    {
        $user = Auth::user();
        if (!$user->store || ($order->store_id !== $user->store->id && $user->role !== 'admin')) {
            abort(403, 'Accès non autorisé à cette facture.');
        }

        $pdfOutput = $this->invoiceService->generateInvoicePdf($order);

        $filename = "Facture_{$order->store->name}_{$order->tracking_code}.pdf";

        return response()->streamDownload(function () use ($pdfOutput) {
            echo $pdfOutput;
        }, $filename, [
            'Content-Type' => 'application/pdf',
        ]);
    }

    /**
     * Preview inline PDF invoice for an order.
     */
    public function preview(Order $order)
    {
        $user = Auth::user();
        if (!$user->store || ($order->store_id !== $user->store->id && $user->role !== 'admin')) {
            abort(403, 'Accès non autorisé à cette facture.');
        }

        $pdfOutput = $this->invoiceService->generateInvoicePdf($order);

        return response($pdfOutput, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="Facture_' . $order->tracking_code . '.pdf"',
        ]);
    }
}
