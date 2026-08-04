<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use App\Services\OrderInvoiceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $invoices = $query->latest()->paginate(12)->withQueryString();

        $allOrders = Order::where('store_id', $store->id)->get();

        $paidOrders = $allOrders->filter(function ($o) {
            return in_array($o->status, ['paid', 'PAID', 'in_delivery', 'delivered']);
        });

        $pendingOrders = $allOrders->filter(function ($o) {
            return in_array($o->status, ['pending', 'UNPAID', 'unpaid']);
        });

        $stats = [
            'total_invoices' => $allOrders->count(),
            'total_amount' => (float) $paidOrders->sum('price_vendor'),
            'paid_count' => $paidOrders->count(),
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
            ],
            'appUrl' => config('app.url', 'http://localhost:8000'),
        ]);
    }

    /**
     * Create manual invoice for a customer.
     */
    public function storeManualInvoice(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $store = $user->store;

        if (!$store) {
            abort(403);
        }

        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:50'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'customer_whatsapp' => ['nullable', 'string', 'max:50'],
            'delivery_address' => ['nullable', 'string', 'max:500'],
            'amount' => ['required', 'numeric', 'min:100'],
            'description' => ['required', 'string', 'max:1000'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        // Customer lookup or create
        $customer = Customer::firstOrNew(['phone' => $validated['customer_phone']]);
        $customer->name = $validated['customer_name'];
        if (!empty($validated['customer_email'])) {
            $customer->email = $validated['customer_email'];
        }
        if (!empty($validated['customer_whatsapp'])) {
            $customer->whatsapp = $validated['customer_whatsapp'];
        }
        $customer->delivery_address = $validated['delivery_address'] ?? 'Livraison manuelle';
        $customer->city = 'Cotonou';
        $customer->save();

        // Invoice Number format: BLK-FAC-XXXXXXXX
        $invoiceCode = 'BLK-FAC-' . strtoupper(Str::random(8));
        $totalAmount = (float) $validated['amount'];

        $order = Order::create([
            'uuid' => (string) Str::uuid(),
            'tracking_code' => $invoiceCode,
            'store_id' => $store->id,
            'customer_id' => $customer->id,
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'],
            'customer_email' => $validated['customer_email'] ?? null,
            'city' => $customer->city,
            'address_details' => $customer->delivery_address,
            'price_vendor' => $totalAmount,
            'saas_margin' => 0,
            'api_fee' => 0,
            'total_client' => $totalAmount,
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_phone' => $validated['customer_phone'],
        ]);

        $firstProduct = $store->products()->first();

        $order->items()->create([
            'product_id' => $firstProduct ? $firstProduct->id : null,
            'product_title' => $validated['description'],
            'quantity' => 1,
            'unit_price_vendor' => $totalAmount,
            'total_price_vendor' => $totalAmount,
        ]);

        // Try sending email if provided
        if (!empty($validated['customer_email'])) {
            try {
                $this->invoiceService->sendOrderInvoiceEmails($order);
            } catch (\Exception $e) {
                // Ignore email failure
            }
        }

        return redirect()->back()->with('message', "Facture manuelle {$invoiceCode} créée avec succès !");
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

        if ($order->customer_email) {
            try {
                $this->invoiceService->sendOrderInvoiceEmails($order);
            } catch (\Exception $e) {
                // Ignore
            }
        }

        return redirect()->back()->with('message', 'Relance envoyée avec succès au client !');
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
