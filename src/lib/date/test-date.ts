import { adToBS, bsToAD } from './bs';

const adDate = new Date(2026, 8, 18);

const bsDate = adToBS(adDate);

console.log('AD:', adDate);
console.log('BS:', bsDate);

const convertedBack = bsToAD(bsDate.year, bsDate.month, bsDate.day);

console.log('Back to AD:', convertedBack);
