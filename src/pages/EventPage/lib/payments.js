import qris from '../../../assets/QRIS.svg';
import gopay from '../../../assets/Gopay.svg';
import ovo from '../../../assets/OVO.svg';
import dana from '../../../assets/DANA.svg';
import shoopePay from '../../../assets/Shopee-Pay.svg';
import bca from '../../../assets/BCA.svg';
import mandiri from '../../../assets/Mandiri.svg';
import bni from '../../../assets/BNI.svg';
import bri from '../../../assets/BRI.svg';
import creditCard from '../../../assets/Credit-Card.svg';

const qrisEnabled = true; // Set to true to enable QRIS, false to disable

export const payments = [
  // QRIS group – item contains disabled flag and optional note
  {
    group: 'QRIS',
    items: [
      {
        label: 'QRIS',
        icon: qris,
        code: 'qris',
        disabled: !qrisEnabled,
        note: !qrisEnabled ? 'Under maintenance' : null,
      },
    ],
  },
  // {
  //   group: 'E-Wallet',
  //   items: [
  //     { label: 'Gopay', icon: gopay, code: 'gopay' },
  //     { label: 'OVO', icon: ovo, code: 'other_qris' },
  //     { label: 'Dana', icon: dana, code: 'other_qris' },
  //     { label: 'ShopeePay', icon: shoopePay, code: 'shopeepay' },
  //   ],
  // },
  // {
  //   group: 'Virtual Account',
  //   items: [
  //     { label: 'BCA Virtual Account', icon: bca, code: 'bca_va' },
  //     { label: 'Mandiri Virtual Account', icon: mandiri, code: 'other_va' },
  //     { label: 'BNI Virtual Account', icon: bni, code: 'bni_va' },
  //     { label: 'BRI Virtual Account', icon: bri, code: 'bri_va' },
  //   ],
  // },
  // {
  //   group: 'Credit Card',
  //   items: [{ label: 'Credit Card', icon: creditCard, code: 'credit_card' }],
  // },
];

export function resolvePaymentCodeByLabel(selectedLabel) {
  if (!selectedLabel) return '';
  for (const group of payments) {
    const found = group.items.find((item) => item.label === selectedLabel);
    if (found) return found.code;
  }
  return '';
}
