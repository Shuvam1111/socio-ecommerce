import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'src/data');
const read = (name) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
const write = (name, value) => fs.writeFileSync(path.join(dir, name), JSON.stringify(value, null, 2) + '\n');
const iso = (day, hour = 10) => `2026-09-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00:00Z`;

const usersData = read('users.json');
const users = usersData.users;
const extraUsers = [
  ['USR-000010','priya','Priya','Adhikari','priya.demo@example.com','9855551001'],
  ['USR-000011','bikash','Bikash','Karki','bikash.demo@example.com','9855551002'],
  ['USR-000012','maya','Maya','Tamang','maya.demo@example.com','9855551003'],
  ['USR-000013','nabin','Nabin','Shrestha','nabin.demo@example.com','9855551004'],
  ['USR-000014','sarita','Sarita','Joshi','sarita.demo@example.com','9855551005'],
  ['USR-000015','dipak','Dipak','Bhandari','dipak.demo@example.com','9855551006'],
  ['USR-000016','ramesh','Ramesh','KC','ramesh.demo@example.com','9855551007'],
];
for (const [id, username, firstName, lastName, email, phone] of extraUsers) if (!users.some((u) => u.id === id)) users.push({ id, username, firstName, lastName, email, phone, password: 'Demo@123', roles: ['buyer'], activeRole: 'buyer', status: 'active', isVerified: true, promotionStatus: 'not_eligible', createdAt: iso(29) });
write('users.json', usersData);

const vendorsData = read('vendors.json');
const vendorTemplates = [
  ['VEN-000002','USR-000010','Himalayan Home Studio','himalayan-home','Furniture and home essentials.','Bagmati','Lalitpur','approved'],
  ['VEN-000003','USR-000011','Trailblazer Sports','trailblazer-sports','Outdoor and fitness equipment.','Gandaki','Pokhara','approved'],
  ['VEN-000004','USR-000012','Ktm Beauty Lab','ktm-beauty-lab','Personal care and wellness products.','Bagmati','Kathmandu','approved'],
  ['VEN-000005','USR-000013','Sajilo Pantry','sajilo-pantry','Packaged foods and everyday groceries.','Bagmati','Bhaktapur','pending'],
  ['VEN-000006','USR-000014','Craftline Workshop','craftline-workshop','Tools and handmade goods.','Bagmati','Kathmandu','inactive'],
];
for (const [id, ownerUserId, name, slug, description, province, city, status] of vendorTemplates) if (!vendorsData.vendors.some((v) => v.id === id)) vendorsData.vendors.push({ id, ownerUserId, store: { name, slug, description, logo: `/images/vendors/${slug}/logo.png`, coverImage: `/images/vendors/${slug}/cover.jpg` }, business: { businessType: 'Individual', legalName: `${name} Pvt. Ltd.`, registrationNumber: `REG-${id.slice(-6)}`, panNumber: `PAN-${id.slice(-6)}001`, vatRegistered: true }, contact: { email: `${slug}@example.com`, phone: '985555' + id.slice(-4), alternatePhone: '984555' + id.slice(-4) }, address: { province, district: city, city, street: 'Main Market', postalCode: '44600' }, pickupAddress: { province, district: city, city, street: 'Main Market' }, returnAddress: { province, district: city, city, street: 'Main Market' }, documents: { businessRegistration: `/documents/vendors/${id}/registration.pdf`, panDocument: `/documents/vendors/${id}/pan.pdf`, ownerIdentity: `/documents/vendors/${id}/identity.pdf` }, bankAccount: { bankName: 'Nabil Bank', accountName: name, accountNumber: `22${id.slice(-6)}90`, verified: status === 'approved' }, superSellerId: null, status, createdAt: iso(28), ...(status === 'approved' ? { approvedAt: iso(29) } : {}) });
write('vendors.json', vendorsData);

const sellersData = read('sellers.json');
const sellerTemplates = [
  ['SEL-000004','USR-000010','VEN-000002','super_seller','Store Manager','active'],
  ['SEL-000005','USR-000011','VEN-000002','seller','Sales Associate','active'],
  ['SEL-000006','USR-000012','VEN-000003','super_seller','Store Manager','active'],
  ['SEL-000007','USR-000013','VEN-000003','seller','Sales Associate','active'],
  ['SEL-000008','USR-000014','VEN-000004','super_seller','Store Manager','active'],
  ['SEL-000009','USR-000015','VEN-000004','seller','Sales Associate','active'],
  ['SEL-000010','USR-000016','VEN-000005','seller','Pending Sales Associate','inactive'],
];
for (const [id, userId, vendorId, role, designation, status] of sellerTemplates) if (!sellersData.sellers.some((s) => s.id === id)) sellersData.sellers.push({ id, userId, vendorId, role, employee: { employeeCode: `EMP-${id.slice(-3)}`, designation, joiningDate: '2026-09-29' }, permissions: role === 'super_seller' ? ['manage_products','manage_inventory','manage_orders','add_sellers','remove_sellers','manage_seller_permissions','view_sales'] : ['manage_products','manage_inventory','process_orders','view_sales'], createdBy: role === 'super_seller' ? 'USR-000002' : sellersData.sellers.find((s) => s.vendorId === vendorId && s.role === 'super_seller')?.id ?? 'USR-000002', status });
write('sellers.json', sellersData);

const categories = read('categories.json').categories;
const subData = read('subcategories.json');
const subNames = { 'CAT-001':['Laptops','Cameras'], 'CAT-002':['Power Banks','Smart Watches'], 'CAT-006':['Chairs','Tables','Kitchen Storage'], 'CAT-009':['Fitness Equipment','Camping Gear'], 'CAT-010':['Hand Tools','Power Tools'], 'CAT-011':['Business Books','Nepali Literature'] };
let subIndex = subData.subcategories.length + 1;
for (const [categoryId, names] of Object.entries(subNames)) for (const name of names) if (!subData.subcategories.some((s) => s.categoryId === categoryId && s.name === name)) { const id = `SUB-${String(subIndex++).padStart(3,'0')}`; subData.subcategories.push({ id, categoryId, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g,'-'), status: 'active' }); }
write('subcategories.json', subData);

const existingProducts = read('products.json').products;
const sellers = sellersData.sellers.filter((s) => s.status === 'active');
const activeSubs = subData.subcategories;
const names = ['Alpine Laptop Stand','Everest Wireless Keyboard','Summit Trail Backpack','Lalitpur Linen Chair','Glow Botanicals Face Wash','Smart Fitness Band','Bamboo Kitchen Organizer','Compact Drill Set','Acoustic Reading Lamp','Daily Planner Notebook','Aero Yoga Mat','Himalayan Coffee Beans','Everyday Cotton Shirt','Studio Bluetooth Mic','Rechargeable Table Fan','Minimal Desk Lamp','Travel Water Bottle','Pocket Power Bank','Herbal Hair Oil','Classic Canvas Sneakers'];
const productImages = ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853','https://images.unsplash.com/photo-1503602642458-232111445657','https://images.unsplash.com/photo-1517836357463-d25dfeac3438','https://images.unsplash.com/photo-1523275335684-37898b6baf30','https://images.unsplash.com/photo-1542291026-7eec264c27ff'];
for (let i = existingProducts.length; i < 50; i++) { const seller = sellers[i % sellers.length]; const category = categories[i % categories.length]; const sub = activeSubs.find((s) => s.categoryId === category.id); const base = 900 + (i * 733) % 68000; const sale = Math.round(base * (0.78 + (i % 5) * 0.04)); const quantity = [4,18,0,64,9][i % 5]; const reserved = quantity === 0 ? 0 : i % 4; const name = names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ''); const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,'-'); const image = productImages[i % productImages.length] + '?auto=format&fit=crop&w=900&q=80'; existingProducts.push({ id:`PROD-${String(i+1).padStart(6,'0')}`, vendorId:seller.vendorId, sellerId:seller.id, categoryId:category.id, subcategoryId:sub?.id ?? null, name, slug, brand:['Aster','Himalayan','KTM','Sajilo','Northstar'][i%5], model:`MD-${2026}${String(i+1).padStart(2,'0')}`, description:`Reliable ${name.toLowerCase()} designed for everyday use, with practical features and dependable local support.`, shortDescription:`A practical ${name.toLowerCase()} for modern Nepali homes and workspaces.`, images:[image, productImages[(i+1)%productImages.length]+'?auto=format&fit=crop&w=900&q=80'], video:null, pricing:{regularPrice:base,salePrice:sale,currency:'NPR',discountPercentage:Number(((1-sale/base)*100).toFixed(2))}, inventory:{sku:`SKU-${String(i+1).padStart(5,'0')}`,barcode:`8900001${String(i+1).padStart(5,'0')}`,quantity,availableQuantity:quantity-reserved,reservedQuantity:reserved,lowStockThreshold:8}, variants:[], attributes:{color:['Black','White','Blue','Natural'][i%4], material:['ABS','Cotton','Aluminium','Bamboo'][i%4]}, shipping:{freeShipping:i%3===0,shippingFee:i%3===0?0:120,estimatedDeliveryDays:'2-5'}, returnPolicy:{returnable:true,returnDays:7}, commission:{influencerPercentage:5,affiliatePercentage:3}, rating:{average:Number((3.7+(i%14)/10).toFixed(1)),count:i%9}, soldCount:i*3%120,viewCount:100+i*37,status:['approved','approved','approved','pending','inactive','rejected'][i%6],createdAt:iso(20+i%10),updatedAt:iso(29)}); }
write('products.json', { products: existingProducts });

const ordersData = read('orders.json');
const buyers = users.filter((u) => u.roles.includes('buyer'));
for (let i = ordersData.orders.length; i < 25; i++) { const product = existingProducts[i % existingProducts.length]; const buyer = buyers[i % buyers.length]; const quantity = (i % 3) + 1; const subtotal = product.pricing.salePrice * quantity; const status = ['paid','processing','ready_to_deliver','out_for_delivery','delivered','cancelled','refund_requested'][i%7]; const paid = !['pending_payment','cancelled'].includes(status); const orderId=`ORD-${String(i+1).padStart(6,'0')}`; ordersData.orders.push({ id:orderId, orderNumber:`SC-202609${String(29-i%10).padStart(2,'0')}-${String(i+1).padStart(4,'0')}`, buyerId:buyer.id,vendorId:product.vendorId,sellerId:product.sellerId,items:[{productId:product.id,sellerId:product.sellerId,vendorId:product.vendorId,name:product.name,sku:product.inventory.sku,quantity,unitPrice:product.pricing.salePrice,totalPrice:subtotal}],pricing:{subtotal,deliveryFee:product.shipping.shippingFee,discount:0,tax:0,total:subtotal+product.shipping.shippingFee},paymentId:`PAY-${String(i+1).padStart(6,'0')}`,payment:{method:i%2?'cash_on_delivery':'online',status:paid?'paid':'pending',transactionId:paid?`TXN-${String(i+1).padStart(10,'0')}`:null,paidAt:paid?iso(21+i%8,11):null},status,shippingAddress:{fullName:`${buyer.firstName} ${buyer.lastName}`,phone:buyer.phone,province:'Bagmati',district:'Kathmandu',city:'Kathmandu',street:'Demo Street',postalCode:'44600'},customerNote:null,timeline:[{status:'placed',changedBy:buyer.id,timestamp:iso(20+i%9,9)},...(paid?[{status:'paid',changedBy:'system',timestamp:iso(20+i%9,10)}]:[])],createdAt:iso(20+i%9,9),updatedAt:iso(29)}); }
write('orders.json', ordersData);

const reviewsData = read('reviews.json');
for (let i = reviewsData.reviews.length; i < 20; i++) { const order = ordersData.orders.find((o) => o.status === 'delivered') ?? ordersData.orders[i%ordersData.orders.length]; const item = order.items[0]; reviewsData.reviews.push({ id:`REV-${String(i+1).padStart(6,'0')}`,productId:item.productId,vendorId:item.vendorId,buyerId:order.buyerId,orderId:order.id,rating:3+(i%3),title:['Good value','Worth the price','Works as expected'][i%3],comment:'A useful demo review from a verified customer with clear delivery and product feedback.',images:[],verifiedPurchase:true,helpfulCount:i%8,status:['approved','approved','pending','rejected'][i%4],createdAt:iso(22+i%7) }); }
write('reviews.json', reviewsData);

const notificationTypes = ['order','payment','inventory','product','review','vendor'];
const notifications = Array.from({length:25},(_,i) => { const recipient = i%3===0 ? 'USR-000001' : i%3===1 ? sellers[i%sellers.length].userId : buyers[i%buyers.length].id; const role = recipient==='USR-000001'?'admin':sellers.some(s=>s.userId===recipient)?sellers.find(s=>s.userId===recipient).role:'buyer'; return {id:`NTF-${String(i+1).padStart(6,'0')}`,recipientId:recipient,recipientRole:role,type:notificationTypes[i%notificationTypes.length],title:['Order update','Payment confirmed','Low stock alert','Product moderation','New review','Vendor application'][i%6],message:'There is a new activity that needs your attention in the Socio Commerce demo workspace.',isRead:i%4===0,entityType:i%2?'product':'order',entityId:i%2?existingProducts[i%existingProducts.length].id:ordersData.orders[i%ordersData.orders.length].id,actionUrl:'/seller/dashboard',createdAt:iso(25+i%5)}; });
write('notifications.json',{notifications});

const invData = read('inventory-activities.json');
const activities = Array.isArray(invData) ? invData : invData.activities ?? [];
for (let i = activities.length; i < 30; i++) activities.push({id:`INV-ACT-${String(i+1).padStart(6,'0')}`,productId:existingProducts[i%existingProducts.length].id,sellerId:existingProducts[i%existingProducts.length].sellerId,vendorId:existingProducts[i%existingProducts.length].vendorId,action:['stock_added','stock_adjusted','stock_reserved','stock_released','stock_finalized'][i%5],quantity:Math.max(1,(i%12)+1),reason:'Demo inventory activity',createdAt:iso(24+i%6)});
write('inventory-activities.json', Array.isArray(invData) ? activities : {...invData,activities});

console.log(JSON.stringify({users:users.length,vendors:vendorsData.vendors.length,sellers:sellersData.sellers.length,products:existingProducts.length,orders:ordersData.orders.length,reviews:reviewsData.reviews.length,notifications:notifications.length,inventoryActivities:activities.length}));
