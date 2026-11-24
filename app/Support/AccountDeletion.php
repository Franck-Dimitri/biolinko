<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Suppression définitive d'un compte vendeur : le compte, sa boutique et tout ce qui en dépend.
 * Tout est supprimé explicitement, dans une transaction, sans compter sur les clés étrangères de la base :
 * une boutique orpheline garderait son adresse (« déjà prise ») alors que le compte n'existe plus.
 */
class AccountDeletion
{
    /** Argent encore sur le portefeuille : la suppression attend que le vendeur l'ait retiré. */
    public static function blockingBalance(User $user): float
    {
        $storeIds = DB::table('stores')->where('user_id', $user->id)->pluck('id');

        return (float) DB::table('wallets')->whereIn('store_id', $storeIds)
            ->selectRaw('COALESCE(SUM(balance_available + balance_pending + balance_held), 0) as total')->value('total');
    }

    public static function delete(User $user): void
    {
        DB::transaction(function () use ($user) {
            static::purgeStores(DB::table('stores')->where('user_id', $user->id)->pluck('id')->all());

            DB::table('whatsapp_campaigns')->where('user_id', $user->id)->delete();
            DB::table('seller_verifications')->where('user_id', $user->id)->delete();
            DB::table('subscriptions')->where('user_id', $user->id)->delete();
            DB::table('sessions')->where('user_id', $user->id)->delete();
            DB::table('password_reset_tokens')->where('email', $user->email)->delete();
            DB::table('users')->where('id', $user->id)->delete();
        });
    }

    /** Supprime des boutiques et toutes leurs données (des feuilles vers la racine). */
    public static function purgeStores(array $storeIds): void
    {
        if (! $storeIds) {
            return;
        }
        $orders = DB::table('orders')->whereIn('store_id', $storeIds)->pluck('id');
        $products = DB::table('products')->whereIn('store_id', $storeIds)->pluck('id');
        $wallets = DB::table('wallets')->whereIn('store_id', $storeIds)->pluck('id');

        DB::table('refunds')->whereIn('order_id', $orders)->delete();
        DB::table('order_items')->whereIn('order_id', $orders)->delete();
        DB::table('order_reports')->whereIn('order_id', $orders)->orWhereIn('store_id', $storeIds)->delete();
        DB::table('withdrawals')->whereIn('wallet_id', $wallets)->delete();
        DB::table('orders')->whereIn('id', $orders)->update(['parent_order_id' => null]);
        DB::table('recurring_baskets')->whereIn('store_id', $storeIds)->update(['first_order_id' => null]);
        DB::table('orders')->whereIn('id', $orders)->delete();
        DB::table('product_variants')->whereIn('product_id', $products)->delete();
        DB::table('store_reviews')->whereIn('store_id', $storeIds)->orWhereIn('product_id', $products)->delete();

        foreach (['products', 'promo_codes', 'recurring_baskets', 'whatsapp_campaigns', 'smart_links', 'store_customer',
            'store_design_versions', 'store_reports', 'store_slug_redirects', 'page_visits', 'wallets'] as $table) {
            DB::table($table)->whereIn('store_id', $storeIds)->delete();
        }
        DB::table('stores')->whereIn('id', $storeIds)->delete();
    }
}
