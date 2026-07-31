<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\OrderInvoiceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        $stats = [
            'total_invoices' => $allOrders->count(),
            'total_amount' => (float) $allOrders->where('status', 'paid')->sum('total_client'),
            'paid_count' => $allOrders->where('status', 'paid')->count(),
        ];

        return Inertia::render('Seller/Invoices/Index', [
            'invoices' => $invoices,
            'stats' => $stats,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'all'),
            ],
        ]);
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

        $filename = "Facture_BIOLINKO_{$order->tracking_code}.pdf";

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
