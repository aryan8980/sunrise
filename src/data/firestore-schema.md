# Firestore Schema

## collections/users/{uid}
- email: string
- name: string
- role: "owner" | "manager"
- createdAt: number (unix ms)

## collections/products/{productId}
- name: string
- category: string
- description: string
- sizes: string[]
- images: string[]
- available: boolean
- price: number
- viewsCount: number
- createdAt: number

## collections/categories/{categoryId}
- name: string
- order: number

## collections/inquiries/{inquiryId}
- name: string
- email: string
- productReference: string
- message: string
- status: "pending" | "ongoing" | "done"
- createdAt: number

## collections/clients/{clientId}
- name: string
- phone: string
- email: string
- address: string
- clientType: string
- notes: string
- createdAt: number

### collections/clients/{clientId}/orders/{orderId}
- orderDate: string (YYYY-MM-DD)
- productName: string
- quantity: number
- price: number
- totalAmount: number
- paymentMode: string
- deliveryStatus: string
- remarks: string
