export const seedData = {
  users: [
    {
      id: 'owner_uid_001',
      email: 'owner@sunrisestudio.com',
      name: 'Brand Owner',
      role: 'owner',
      createdAt: 1765200000000
    },
    {
      id: 'manager_uid_001',
      email: 'manager@sunrisestudio.com',
      name: 'Store Manager',
      role: 'manager',
      createdAt: 1765200000000
    }
  ],
  categories: [
    { name: 'Men', order: 1 },
    { name: 'Women', order: 2 },
    { name: 'Ethnic', order: 3 },
    { name: 'Casual', order: 4 },
    { name: 'Festive', order: 5 }
  ],
  products: [
    {
      name: 'Structured Linen Jacket',
      category: 'Men',
      description: 'Lightweight tailored jacket with soft shoulder construction.',
      sizes: ['S', 'M', 'L'],
      images: [
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea',
        'https://images.unsplash.com/photo-1483985988355-763728e1935b'
      ],
      available: true,
      price: 240,
      viewsCount: 124,
      createdAt: 1765200100000
    },
    {
      name: 'Silk Festive Drape Set',
      category: 'Festive',
      description: 'Contemporary festive drape with hand-finish accents.',
      sizes: ['M', 'L', 'XL'],
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1'
      ],
      available: true,
      price: 310,
      viewsCount: 189,
      createdAt: 1765200200000
    }
  ],
  inquiries: [
    {
      name: 'Ava Johnson',
      email: 'ava@example.com',
      productReference: 'Structured Linen Jacket',
      message: 'Is this available in XL for LA store pickup?',
      resolved: false,
      createdAt: 1765200400000
    }
  ],
  clients: [
    {
      id: 'client_001',
      name: 'Noor Lifestyle Boutique',
      phone: '+1-917-555-0109',
      email: 'buying@noorlifestyle.com',
      address: 'New York, NY',
      clientType: 'B2B',
      notes: 'Seasonal bulk buyer',
      createdAt: 1765200500000,
      orders: [
        {
          orderDate: '2026-01-20',
          productName: 'Structured Linen Jacket',
          quantity: 20,
          price: 180,
          totalAmount: 3600,
          paymentMode: 'Bank Transfer',
          deliveryStatus: 'Delivered',
          remarks: 'On-time shipment'
        }
      ]
    }
  ]
};
