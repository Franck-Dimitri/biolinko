// Promotions et packs visibles quel que soit le template (npm run test:js)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listedPacks, withCommerce } from '../../resources/js/Components/Storefront/Design/commerce.js';

const template = (sections) => ({ template: 'pat-douceur', sections });
const types = (d) => d.sections.map((s) => s.type);

test('un template sans section Packs en reçoit une, juste après le catalogue', () => {
    const d = withCommerce(template([{ id: 'hero', type: 'hero' }, { id: 'products', type: 'products' }, { id: 'reviews', type: 'reviews' }, { id: 'footer', type: 'footer' }]));
    assert.deepEqual(types(d), ['hero', 'products', 'promo', 'packs', 'reviews', 'footer']);
    assert.equal(d.sections.find((s) => s.type === 'packs').enabled, true);
});

test('une section Packs masquée par le vendeur reste masquée', () => {
    const d = withCommerce(template([{ id: 'products', type: 'products' }, { id: 'packs', type: 'packs', enabled: false }, { id: 'promo', type: 'promo', variant: 'flash' }]));
    assert.equal(d.sections.filter((s) => s.type === 'packs').length, 1);
    assert.equal(d.sections.find((s) => s.type === 'packs').enabled, false);
});

test('rien n’est ajouté quand le template a déjà ses sections', () => {
    const base = template([{ id: 'products', type: 'products' }, { id: 'promo', type: 'promo', variant: 'flash' }, { id: 'packs', type: 'packs' }]);
    assert.equal(withCommerce(base), base);
});

test('un pack mis en avant par une offre Combo n’est pas répété dans la liste', () => {
    const d = template([{ id: 'promo', type: 'promo', variant: 'combo', enabled: true }]);
    assert.deepEqual(listedPacks(d, ['a', 'b', 'c']), ['b', 'c']);
    assert.deepEqual(listedPacks(template([]), ['a', 'b']), ['a', 'b']);
});
