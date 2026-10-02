import type { LegalDocument } from '@/types/legal';

export const termsDocument: LegalDocument = {
  type: 'terms',

  title: 'Terms & Conditions',

  description:
    'Please read these Terms & Conditions carefully before using Socio Commerce. These terms govern your access to and use of our platform, products, services, and related features.',

  lastUpdated: 'September 22, 2026',

  sections: [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',

      content: [
        {
          type: 'paragraph',
          text: 'By accessing, browsing, registering with, or using Socio Commerce, you agree to be bound by these Terms & Conditions and any applicable policies referenced in them.',
        },
        {
          type: 'paragraph',
          text: 'If you do not agree with any part of these terms, you should not use our platform or services.',
        },
      ],
    },

    {
      id: 'about-platform',
      title: '2. About Socio Commerce',

      content: [
        {
          type: 'paragraph',
          text: 'Socio Commerce is an online commerce platform that allows users to discover, browse, purchase, and interact with products and services offered through the platform.',
        },
        {
          type: 'paragraph',
          text: 'We may update, modify, suspend, or discontinue any part of the platform or its features from time to time.',
        },
      ],
    },

    {
      id: 'user-accounts',
      title: '3. User Accounts',

      content: [
        {
          type: 'paragraph',
          text: 'Some features of Socio Commerce may require you to create an account. You are responsible for providing accurate and up-to-date information when creating and maintaining your account.',
        },
      ],

      subsections: [
        {
          id: 'account-responsibility',
          title: '3.1 Account Responsibility',

          content: [
            {
              type: 'bullets',
              items: [
                'You are responsible for maintaining the confidentiality of your account credentials.',
                'You are responsible for activities performed through your account.',
                'You should notify us promptly if you believe your account has been accessed without authorization.',
                'You must not use another person’s account without appropriate authorization.',
              ],
            },
          ],
        },

        {
          id: 'account-information',
          title: '3.2 Account Information',

          content: [
            {
              type: 'paragraph',
              text: 'We may require certain information to process orders, provide services, communicate with you, and maintain the security of your account.',
            },
          ],
        },
      ],
    },

    {
      id: 'products-pricing',
      title: '4. Products and Pricing',

      content: [
        {
          type: 'paragraph',
          text: 'We make reasonable efforts to ensure that product descriptions, images, prices, availability, and other information displayed on the platform are accurate. However, errors or inaccuracies may occasionally occur.',
        },
        {
          type: 'paragraph',
          text: 'Product availability and pricing may change without prior notice. Any applicable taxes, delivery charges, or additional fees will be communicated where applicable.',
        },
      ],

      subsections: [
        {
          id: 'product-information',
          title: '4.1 Product Information',

          content: [
            {
              type: 'bullets',
              items: [
                'Product images may vary slightly from the actual product.',
                'Product specifications and availability may change.',
                'Descriptions are provided for general informational purposes.',
              ],
            },
          ],
        },

        {
          id: 'pricing-errors',
          title: '4.2 Pricing Errors',

          content: [
            {
              type: 'paragraph',
              text: 'If a product is listed with an incorrect price due to a technical, typographical, or other error, we reserve the right to correct the price and take appropriate action regarding affected orders.',
            },
          ],
        },
      ],
    },

    {
      id: 'orders',
      title: '5. Orders and Payments',

      content: [
        {
          type: 'paragraph',
          text: 'Placing an order through Socio Commerce constitutes a request to purchase the selected products. An order may be subject to availability, verification, and payment confirmation.',
        },
      ],

      subsections: [
        {
          id: 'order-confirmation',
          title: '5.1 Order Confirmation',

          content: [
            {
              type: 'paragraph',
              text: 'After placing an order, you may receive an order confirmation containing relevant order details. An order confirmation does not necessarily guarantee fulfillment if the product becomes unavailable or an issue is identified with the order.',
            },
          ],
        },

        {
          id: 'payment',
          title: '5.2 Payments',

          content: [
            {
              type: 'paragraph',
              text: 'You agree to provide valid and authorized payment information when required. Payments may be processed through third-party payment providers.',
            },
          ],
        },
      ],
    },

    {
      id: 'shipping-delivery',
      title: '6. Shipping and Delivery',

      content: [
        {
          type: 'paragraph',
          text: 'Delivery times may vary depending on product availability, delivery location, logistics providers, weather conditions, public holidays, and other circumstances beyond our reasonable control.',
        },
        {
          type: 'paragraph',
          text: 'Any estimated delivery date or time is provided for guidance and may not constitute a guaranteed delivery deadline unless explicitly stated otherwise.',
        },
      ],
    },

    {
      id: 'returns-refunds',
      title: '7. Returns, Cancellations and Refunds',

      content: [
        {
          type: 'paragraph',
          text: 'Returns, cancellations, exchanges, and refunds are subject to the applicable policies for the relevant product or order.',
        },
      ],

      subsections: [
        {
          id: 'cancellation',
          title: '7.1 Order Cancellation',

          content: [
            {
              type: 'paragraph',
              text: 'Depending on the order status, you may be able to cancel an order before it has been processed or dispatched. Cancellation availability may vary by product.',
            },
          ],
        },

        {
          id: 'refunds',
          title: '7.2 Refunds',

          content: [
            {
              type: 'paragraph',
              text: 'Where a refund is approved, the applicable refund amount and processing time may depend on the payment method, product condition, and applicable policies.',
            },
          ],
        },
      ],
    },

    {
      id: 'prohibited-use',
      title: '8. Prohibited Uses',

      content: [
        {
          type: 'paragraph',
          text: 'You agree not to misuse the platform or use it for unlawful, fraudulent, abusive, or unauthorized purposes.',
        },
        {
          type: 'bullets',
          items: [
            'Attempting to gain unauthorized access to the platform or another user’s account.',
            'Using the platform to conduct fraudulent or deceptive activities.',
            'Uploading malicious code, software, or other harmful content.',
            'Interfering with the operation, security, or availability of the platform.',
            'Using automated systems to collect information without authorization.',
            'Violating applicable laws, regulations, or third-party rights.',
          ],
        },
      ],
    },

    {
      id: 'intellectual-property',
      title: '9. Intellectual Property',

      content: [
        {
          type: 'paragraph',
          text: 'Unless otherwise stated, the platform, including its software, branding, logos, text, graphics, design, and other original content, is owned by or licensed to Socio Commerce and may be protected by applicable intellectual property laws.',
        },
        {
          type: 'paragraph',
          text: 'You may not reproduce, modify, distribute, sell, or commercially exploit protected platform content without appropriate authorization.',
        },
      ],
    },

    {
      id: 'third-party-services',
      title: '10. Third-Party Services and Links',

      content: [
        {
          type: 'paragraph',
          text: 'The platform may integrate with or contain links to third-party websites, payment providers, delivery services, or other external services.',
        },
        {
          type: 'paragraph',
          text: 'Third-party services may have their own terms and privacy policies. Socio Commerce is not responsible for the policies or practices of independent third-party services unless otherwise required by applicable law.',
        },
      ],
    },

    {
      id: 'limitation',
      title: '11. Limitation of Liability',

      content: [
        {
          type: 'paragraph',
          text: 'To the extent permitted by applicable law, Socio Commerce will not be responsible for losses or damages arising from circumstances beyond its reasonable control, interruptions to the platform, third-party services, or unauthorized access caused by circumstances outside our reasonable control.',
        },
        {
          type: 'note',
          title: 'Important',
          text: 'The final wording of this section should be reviewed and approved according to the laws and regulations applicable to the business.',
        },
      ],
    },

    {
      id: 'termination',
      title: '12. Account Suspension and Termination',

      content: [
        {
          type: 'paragraph',
          text: 'We may suspend or terminate access to an account where there is a violation of these Terms & Conditions, suspected fraudulent activity, security concerns, or where otherwise permitted or required by applicable law.',
        },
      ],
    },

    {
      id: 'changes',
      title: '13. Changes to These Terms',

      content: [
        {
          type: 'paragraph',
          text: 'We may update these Terms & Conditions from time to time to reflect changes to our services, business practices, technology, or applicable legal requirements.',
        },
        {
          type: 'paragraph',
          text: 'When changes are made, the updated version will be published on this page with a revised last-updated date.',
        },
      ],
    },

    {
      id: 'governing-law',
      title: '14. Governing Law',

      content: [
        {
          type: 'paragraph',
          text: 'These Terms & Conditions will be interpreted and applied in accordance with the applicable laws and regulations governing the operation of the business.',
        },
        {
          type: 'note',
          title: 'Legal Review Required',
          text: 'This section is a placeholder for the business’s final governing-law and jurisdiction provisions and should be reviewed by qualified legal counsel before production use.',
        },
      ],
    },

    {
      id: 'contact',
      title: '15. Contact Us',

      content: [
        {
          type: 'paragraph',
          text: 'If you have questions regarding these Terms & Conditions, you can contact us using the information provided below.',
        },
      ],
    },
  ],

  contact: {
    company: 'Socio Commerce Pvt. Ltd.',
    email: 'support@sociocommerce.com',
    phone: '+977 98XXXXXXXX',
    address: 'Biratnagar, Koshi Province, Nepal',
  },
};
