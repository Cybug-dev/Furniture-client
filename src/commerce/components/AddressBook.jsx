import { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { useAccountMutation, useAddresses } from '../commerce.hooks.js';
import { AddressText, Card, ErrorMessage, QueryState } from './CommerceUI';

const fields = [
  ['recipientName', 'Full name', 'name', true], ['phone', 'Phone number', 'tel', true],
  ['state', 'State', 'address-level1', true], ['lga', 'LGA', '', true],
  ['city', 'City', 'address-level2', true], ['area', 'Area / district', '', true],
  ['addressLine1', 'Street address', 'address-line1', true], ['addressLine2', 'Apartment / building (optional)', 'address-line2'],
  ['landmark', 'Landmark (optional)', ''], ['postcode', 'Postcode (optional)', 'postal-code'],
  ['country', 'Country', 'country-name', true],
];
function AddressForm({ address, onSaved, onCancel }) {
  const save = useAccountMutation('saveAddress', ['addresses', 'checkout']);
  const [values, setValues] = useState(() => Object.fromEntries([...fields.map(([name]) => [name, address?.[name] || (name === 'state' || name === 'city' ? 'Lagos' : name === 'country' ? 'Nigeria' : '')]), ['deliveryInstructions', address?.deliveryInstructions || ''], ['isDefault', address?.isDefault || false]]));
  const submit = async (event) => {
    event.preventDefault();
    try {
      const payload = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, typeof value === 'string' ? value.replace(/\r?\n/g, ' ').trim() : value]));
      const saved = await save.run({ ...payload, ...(address ? { id: address.id } : {}) });
      if (saved) onSaved(saved);
    } catch { /* Inline normalized error below. */ }
  };
  return <form className="address-form" onSubmit={submit} aria-label={address ? 'Edit address' : 'New address'} aria-describedby={save.error ? 'address-save-error' : undefined}>
    <h3>{address ? 'Edit your address' : 'Add a delivery address'}</h3>
    <p>Demo delivery currently supports Lagos, Nigeria only. No location access is requested.</p>
    <fieldset disabled={save.isPending}>
      <div className="address-form__grid">{fields.map(([name, title, autoComplete, required]) => <label key={name}>{title}<input name={name} value={values[name]} required={Boolean(required)} type={name === 'phone' ? 'tel' : 'text'} autoComplete={autoComplete || 'off'} maxLength={name === 'phone' ? 25 : 200} onChange={(event) => setValues({ ...values, [name]: event.target.value })} /></label>)}</div>
      <label>Delivery instructions (optional)<textarea name="deliveryInstructions" maxLength={500} value={values.deliveryInstructions} onChange={(event) => setValues({ ...values, deliveryInstructions: event.target.value })} /></label>
      <label className="commerce-checkbox"><input type="checkbox" checked={values.isDefault} disabled={address?.isDefault} onChange={(event) => setValues({ ...values, isDefault: event.target.checked })} />Use as my default address</label>
      {address?.isDefault && <p>To change your default, choose another saved address as the default.</p>}
      <div id="address-save-error"><ErrorMessage error={save.error} /></div>
      <div className="commerce-actions"><button className="commerce-button" type="submit">{save.isPending ? 'Saving…' : 'Save address'}</button><button className="commerce-button commerce-button--secondary" type="button" onClick={onCancel}>Cancel</button></div>
    </fieldset>
  </form>;
}
export default function AddressBook({ selectedId, onSelect, selecting = false }) {
  const query = useAddresses();
  const remove = useAccountMutation('deleteAddress', ['addresses', 'checkout']);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState('');
  return <Card title="Saved addresses" icon={MapPin}>
    <QueryState query={query}>
      {!query.data?.length && <p>No saved addresses yet. Add one below.</p>}
      <div className="address-book">{query.data?.map((address) => <article key={address.id} className={`address-book__entry ${address.id === selectedId ? 'is-selected' : ''}`}>
        {onSelect && <label className="commerce-checkbox"><input type="radio" name="deliveryAddress" value={address.id} checked={selectedId === address.id} disabled={selecting || remove.isPending || editing !== null} onChange={() => onSelect(address.id)} />Deliver here</label>}
        {address.isDefault && <span className="commerce-status">Default</span>}
        <AddressText address={address} />
        <div className="commerce-actions"><button type="button" className="commerce-text-button" disabled={selecting || remove.isPending || editing !== null} onClick={() => { setEditing(address); setNotice(''); }}>Edit</button><button type="button" className="commerce-text-button" disabled={selecting || remove.isPending || editing !== null} onClick={() => setDeleting(address.id)}>Remove</button></div>
        {deleting === address.id && <div className="commerce-note"><p>Remove this saved address? Historical orders will not change.</p><div className="commerce-actions"><button className="commerce-button commerce-button--secondary" disabled={remove.isPending} onClick={async () => { try { await remove.run(address.id); setDeleting(null); setNotice('Address removed.'); } catch { /* Shown below. */ } }}>Confirm removal</button><button className="commerce-text-button" disabled={remove.isPending} onClick={() => setDeleting(null)}>Keep address</button></div></div>}
      </article>)}</div>
      <ErrorMessage error={remove.error} />
      {editing !== null ? <AddressForm key={editing.id || 'new'} address={editing.id ? editing : undefined} onCancel={() => setEditing(null)} onSaved={(address) => { setEditing(null); setNotice('Address saved.'); if (onSelect) onSelect(address.id); }} /> : <button className="commerce-button commerce-button--secondary" disabled={selecting || remove.isPending || query.isError || query.data?.length >= 20} onClick={() => setEditing({})}><Plus size={18} />Add new address</button>}
      <p role="status">{notice}</p>
    </QueryState>
  </Card>;
}
