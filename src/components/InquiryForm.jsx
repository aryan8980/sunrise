import { useState } from 'react';
import { submitInquiry } from '../utils/helpers';
import './InquiryForm.css';

const initialState = {
  name: '',
  email: '',
  message: '',
  productReference: ''
};

function InquiryForm() {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus('');

    try {
      await submitInquiry(form);
      setForm(initialState);
      setStatus('Inquiry submitted successfully.');
    } catch (error) {
      setStatus('Failed to submit inquiry.');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className='inquiry-form form-card' onSubmit={handleSubmit}>
      <div className='inquiry-form__row'>
        <label>
          <span>Name *</span>
          <input
            placeholder='Enter your full name'
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label>
          <span>Email *</span>
          <input
            type='email'
            placeholder='Enter your email'
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>
      </div>

      <label>
        <span>Product Reference</span>
        <input
          placeholder='Product name or code'
          value={form.productReference}
          onChange={(e) => setForm({ ...form, productReference: e.target.value })}
        />
      </label>

      <label>
        <span>Message *</span>
        <textarea
          placeholder='Tell us what you are looking for...'
          rows='5'
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
        />
      </label>

      <button className='btn inquiry-form__submit' type='submit' disabled={submitting}>
        {submitting ? 'Submitting...' : 'Send Inquiry'}
      </button>
      {status && <p className='inquiry-form__status'>{status}</p>}
    </form>
  );
}

export default InquiryForm;
