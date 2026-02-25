import { useEffect, useState } from 'react';
import { deleteInquiry, listInquiries, updateInquiry } from '../services/inquiryService';
import toast from 'react-hot-toast';
import './InquiryManagementPage.css';

const statusOptions = ['pending', 'ongoing', 'done'];

function InquiryManagementPage() {
  const [inquiries, setInquiries] = useState([]);

  const loadInquiries = () => listInquiries().then(setInquiries).catch(console.error);
  const buildMailUrl = (email) =>
    `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(
      'Regarding your inquiry'
    )}`;

  useEffect(() => {
    loadInquiries();
  }, []);

  return (
    <section>
      <h1 className='section-title'>Inquiry Management</h1>
      <div className='inquiry-list'>
        {inquiries.map((inquiry) => (
          <article
            key={inquiry.id}
            className={`form-card inquiry-card inquiry-card--${inquiry.status || 'pending'}`}
          >
            <p><strong>{inquiry.name}</strong> ({inquiry.email})</p>
            <p>Ref: {inquiry.productReference || '-'}</p>
            <p>{inquiry.message}</p>
            <div className='inquiry-actions'>
              <label className='inquiry-status'>
                <span>Status:</span>
                <select
                  className={`inquiry-status__select inquiry-status__select--${inquiry.status || 'pending'}`}
                  value={inquiry.status || 'pending'}
                  onChange={(e) => updateInquiry(inquiry.id, { status: e.target.value }).then(() => {
                    toast.success('Status updated.');
                    loadInquiries();
                  })}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <a className='btn btn--ghost' href={buildMailUrl(inquiry.email)} target='_blank' rel='noreferrer'>
                Email
              </a>
              <button className='btn btn--ghost' onClick={() => deleteInquiry(inquiry.id).then(() => {
                toast.success('Inquiry deleted.');
                loadInquiries();
              })}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default InquiryManagementPage;
