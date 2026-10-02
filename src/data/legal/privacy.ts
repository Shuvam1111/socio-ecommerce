import type { LegalDocument } from '@/types/legal';

export const privacyPolicy: LegalDocument = {
  type: 'privacy',

  title: 'Privacy Policy',

  description:
    'This Privacy Policy explains how Socio Commerce collects, uses, shares, and protects your personal information when you use our website, services, and related features.',

  lastUpdated: 'September 22, 2026',

  sections: [
    {
      id: 'introduction',
      title: 'Introduction',

      content: [
        {
          type: 'paragraph',
          text: 'At Socio Commerce, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains what information we collect, why we collect it, how we use it, and the choices available to you.',
        },
        {
          type: 'paragraph',
          text: 'By accessing or using our website and services, you acknowledge that you have read and understood this Privacy Policy.',
        },
      ],
    },

    {
      id: 'information-we-collect',
      title: '1. Information We Collect',

      content: [
        {
          type: 'paragraph',
          text: 'We collect information that you provide directly to us, information generated when you use our services, and information received from certain third-party services.',
        },
      ],

      subsections: [
        {
          id: 'personal-information',
          title: '1.1 Personal Information',
          content: [
            {
              type: 'paragraph',
              text: 'When you create an account, place an order, contact us, or use certain features of the platform, you may voluntarily provide information such as:',
            },
            {
              type: 'bullets',
              items: [
                'Full name and contact information',
                'Email address and phone number',
                'Billing and shipping address',
                'Account credentials',
                'Order and purchase information',
                'Customer support requests and feedback',
                'Information you provide when participating in promotions or surveys',
              ],
            },
          ],
        },

        {
          id: 'transaction-information',
          title: '1.2 Order and Transaction Information',
          content: [
            {
              type: 'paragraph',
              text: 'When you purchase products through Socio Commerce, we collect information necessary to process and fulfill your order.',
            },
            {
              type: 'bullets',
              items: [
                'Products purchased',
                'Order amount and transaction details',
                'Shipping and delivery information',
                'Billing information',
                'Order history and related communications',
              ],
            },
            {
              type: 'note',
              title: 'Payment information',
              text: 'Where applicable, payment information may be processed directly by our payment service providers. We do not necessarily store complete payment card information on our own systems.',
            },
          ],
        },

        {
          id: 'automatically-collected',
          title: '1.3 Information Collected Automatically',
          content: [
            {
              type: 'paragraph',
              text: 'When you browse or interact with our website, certain technical information may be collected automatically, including:',
            },
            {
              type: 'bullets',
              items: [
                'IP address',
                'Browser type and version',
                'Device type and operating system',
                'Pages viewed and features used',
                'Search terms and interaction information',
                'Approximate location derived from technical information',
                'Referring and exit pages',
                'Date, time, and duration of visits',
              ],
            },
          ],
        },

        {
          id: 'cookies',
          title: '1.4 Cookies and Similar Technologies',
          content: [
            {
              type: 'paragraph',
              text: 'We may use cookies and similar technologies to remember your preferences, maintain your session, understand how our platform is used, and improve your shopping experience.',
            },
            {
              type: 'paragraph',
              text: 'You can control or disable cookies through your browser settings. Some features of the platform may not function correctly if certain cookies are disabled.',
            },
          ],
        },
      ],
    },

    {
      id: 'how-we-use',
      title: '2. How We Use Your Information',

      content: [
        {
          type: 'paragraph',
          text: 'We use collected information for purposes that are reasonably necessary to operate our platform and provide our services, including:',
        },
        {
          type: 'bullets',
          items: [
            'Creating and managing user accounts',
            'Processing and fulfilling orders',
            'Arranging delivery and shipment of products',
            'Providing customer support',
            'Sending order confirmations and service notifications',
            'Processing returns, refunds, and exchanges',
            'Improving our website, products, and services',
            'Personalizing your shopping experience',
            'Detecting and preventing fraud or unauthorized activity',
            'Maintaining platform security and reliability',
            'Sending marketing communications where permitted',
            'Complying with applicable legal and regulatory requirements',
          ],
        },
      ],
    },

    {
      id: 'sharing-information',
      title: '3. Sharing of Information',

      content: [
        {
          type: 'paragraph',
          text: 'We may share information with trusted third parties when reasonably necessary to operate our business and provide services to you.',
        },
      ],

      subsections: [
        {
          id: 'service-providers',
          title: '3.1 Service Providers',
          content: [
            {
              type: 'bullets',
              items: [
                'Payment processors',
                'Delivery and logistics providers',
                'Cloud hosting and infrastructure providers',
                'Customer support platforms',
                'Analytics and performance providers',
                'Security and fraud prevention services',
              ],
            },
          ],
        },

        {
          id: 'legal-disclosures',
          title: '3.2 Legal Requirements',
          content: [
            {
              type: 'paragraph',
              text: 'We may disclose information when required by applicable law, regulation, legal process, or a valid request from an authorized government or regulatory authority.',
            },
          ],
        },
      ],
    },

    {
      id: 'data-security',
      title: '4. Data Security',

      content: [
        {
          type: 'paragraph',
          text: 'We use reasonable technical and organizational safeguards designed to protect personal information from unauthorized access, alteration, disclosure, or destruction.',
        },
        {
          type: 'bullets',
          items: [
            'Access controls and authentication mechanisms',
            'Secure communication technologies where appropriate',
            'Restricted access to personal information',
            'Monitoring and security procedures',
            'Reasonable measures for preventing unauthorized access',
          ],
        },
        {
          type: 'note',
          title: 'Important',
          text: 'No method of transmission or electronic storage is completely secure. Although we take reasonable measures to protect your information, we cannot guarantee absolute security.',
        },
      ],
    },

    {
      id: 'data-retention',
      title: '5. Data Retention',

      content: [
        {
          type: 'paragraph',
          text: 'We retain personal information for as long as reasonably necessary to provide our services, maintain business records, resolve disputes, prevent fraud, and comply with applicable legal obligations.',
        },
        {
          type: 'paragraph',
          text: 'The retention period may vary depending on the type of information and the purpose for which it was collected.',
        },
      ],
    },

    {
      id: 'your-rights',
      title: '6. Your Privacy Rights',

      content: [
        {
          type: 'paragraph',
          text: 'Depending on applicable law, you may have certain rights regarding your personal information, including:',
        },
        {
          type: 'bullets',
          items: [
            'Requesting access to personal information we hold about you',
            'Requesting correction of inaccurate or incomplete information',
            'Requesting deletion of personal information where legally permitted',
            'Withdrawing consent for certain processing activities',
            'Unsubscribing from marketing communications',
            'Requesting information about how your data is processed',
          ],
        },
        {
          type: 'paragraph',
          text: 'To submit a privacy-related request, please contact us using the contact information provided below.',
        },
      ],
    },

    {
      id: 'third-party-links',
      title: '7. Third-Party Links',

      content: [
        {
          type: 'paragraph',
          text: 'Our website may contain links to third-party websites, services, or applications. These third parties operate independently and may have their own privacy policies and practices.',
        },
        {
          type: 'paragraph',
          text: 'We recommend reviewing the privacy policies of third-party websites before providing them with personal information.',
        },
      ],
    },

    {
      id: 'children',
      title: '8. Children’s Privacy',

      content: [
        {
          type: 'paragraph',
          text: 'Our services are not intended for individuals who are not legally permitted to use the platform under applicable law. We do not knowingly collect personal information from children in violation of applicable legal requirements.',
        },
      ],
    },

    {
      id: 'policy-changes',
      title: '9. Changes to This Privacy Policy',

      content: [
        {
          type: 'paragraph',
          text: 'We may update this Privacy Policy from time to time to reflect changes in our services, business practices, technology, or applicable legal requirements.',
        },
        {
          type: 'paragraph',
          text: 'When we make changes, we will update the “Last updated” date shown at the beginning of this policy. Where appropriate, we may provide additional notice.',
        },
      ],
    },

    {
      id: 'contact',
      title: '10. Contact Us',

      content: [
        {
          type: 'paragraph',
          text: 'If you have questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact us.',
        },
      ],
    },
  ],

  contact: {
    company: 'Socio Commerce Pvt. Ltd.',
    email: 'privacy@sociocommerce.com',
    phone: '+977 98XXXXXXXX',
    address: 'Biratnagar, Koshi Province, Nepal',
  },
};
