'use client';

/**
 * =====================================================================
 * CHECKOUT PAGE  (redesigned UI, same checkout logic as the MVP)
 * =====================================================================
 * LAYOUT: contact details, delivery address, payment method on the left; order summary on the right
 * (sticky on desktop). On phones the summary sits under the form and a sticky "Place order" bar
 * stays at the bottom (it stops at the end of the form, never covering the footer).
 *
 * NOTES FOR ANOTHER AI / DEVELOPER:
 *   1. LOGIC IS UNCHANGED: same form fields (fullName, phone, province, district, city, street,
 *      postalCode), same payment values ('cash_on_delivery' | 'online'), same POST /api/checkout
 *      request (headers, credentials, body), clear() on success and redirect to /order-success/<id>.
 *      The Place order button is still disabled while loading or when an item is unavailable.
 *   2. Province > District > City are cascading searchable dropdowns (same component and Nepal
 *      data as the vendor registration form). Each also accepts a typed value that is not in the
 *      list, and falls back to a text box when the parent has no data. The saved values are plain
 *      strings in the same fields. Changing a parent clears its children.
 *   3. Every field was `required` before. Validation now runs in submit() (noValidate) because the
 *      dropdowns are not native inputs. Empty fields turn red and the page scrolls to the first one.
 *   4. The NEPAL_ADDRESS block and AddressSelect live in this same file on purpose. To use an
 *      official dataset or a live API, replace only the bodies of getProvinces(), getDistricts()
 *      and getCities().
 *   5. The cart loads from localStorage after the first render, so a skeleton is shown first to avoid
 *      flashing "Your cart is empty".
 *   6. Colors use theme tokens only, so all themes and dark mode keep working.
 */

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Banknote,
  Check,
  ChevronDown,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/features/marketplace/components/use-cart';

/* =====================================================================
 * NEPAL ADDRESS DATA: Province > District > City / Municipality  (kept in this same file)
 * =====================================================================
 * - Provinces (7) and districts (77) follow Nepal's current federal structure.
 * - Cities / municipalities are a BEST-EFFORT list of local levels per district. It is not an
 *   official register, so a few names may be missing or spelled differently. That is why the City
 *   dropdown lets the vendor type a city that is not in the list, and becomes a text box for a
 *   district with no data.
 * CHANGE HERE (for another AI / developer): to use a complete/official dataset or a live API,
 * replace only the BODY of getProvinces(), getDistricts() and getCities() below. The form only
 * calls those three functions.
 * ===================================================================== */
type DistrictMap = Record<string, string[]>;

const NEPAL_ADDRESS: Record<string, DistrictMap> = {
  Koshi: {
    Taplejung: ['Phungling', 'Aathrai Tribeni', 'Sidingba', 'Phaktanglung', 'Mikwakhola', 'Meringden', 'Maiwakhola', 'Pathibhara Yangwarak', 'Sirijangha'],
    Panchthar: ['Phidim', 'Falelung', 'Falgunanda', 'Hilihang', 'Kummayak', 'Miklajung', 'Tumbewa', 'Yangwarak'],
    Ilam: ['Ilam', 'Deumai', 'Mai', 'Suryodaya', 'Phakphokthum', 'Mangsebung', 'Chulachuli', 'Rong', 'Sandakpur', 'Maijogmai'],
    Jhapa: ['Mechinagar', 'Bhadrapur', 'Birtamod', 'Damak', 'Shivasatakshi', 'Arjundhara', 'Gauradaha', 'Kankai', 'Kamal', 'Buddhashanti', 'Kachankawal', 'Jhapa', 'Barhadashi', 'Gaurigunj', 'Haldibari'],
    Morang: ['Biratnagar', 'Belbari', 'Letang', 'Pathari Shanishchare', 'Rangeli', 'Ratuwamai', 'Sundarharaicha', 'Urlabari', 'Sunwarshi', 'Dhanpalthan', 'Gramthan', 'Jahada', 'Kanepokhari', 'Katahari', 'Kerabari', 'Miklajung', 'Budhiganga'],
    Sunsari: ['Itahari', 'Dharan', 'Inaruwa', 'Duhabi', 'Ramdhuni Bhasi', 'Barahachhetra', 'Koshi', 'Harinagar', 'Bhokraha Narsingh', 'Dewanganj', 'Gadhi', 'Barju'],
    Dhankuta: ['Dhankuta', 'Pakhribas', 'Mahalaxmi', 'Sangurigadhi', 'Chaubise', 'Sahidbhumi', 'Chhathar Jorpati'],
    Terhathum: ['Myanglung', 'Laligurans', 'Aathrai', 'Phedap', 'Chhathar', 'Menchayayem'],
    Sankhuwasabha: ['Khandbari', 'Chainpur', 'Dharmadevi', 'Madi', 'Panchkhapan', 'Bhotkhola', 'Chichila', 'Makalu', 'Sabhapokhari', 'Silichong'],
    Bhojpur: ['Bhojpur', 'Shadanand', 'Aamchok', 'Arun', 'Hatuwagadhi', 'Pauwadungma', 'Ramprasad Rai', 'Salpasilichho', 'Tyamke Maiyung'],
    Khotang: ['Diktel Rupakot Majhuwagadhi', 'Halesi Tuwachung', 'Aiselukharka', 'Barahapokhari', 'Diprung Chuichumma', 'Jantedhunga', 'Kepilasgadhi', 'Khotehang', 'Lamidanda', 'Sakela', 'Rawa Besi'],
    Solukhumbu: ['Solududhkunda', 'Dudhkoshi', 'Dudhkaushika', 'Khumbu Pasanglhamu', 'Likhu Pike', 'Mahakulung', 'Necha Salyan', 'Sotang', 'Thulung Dudhkoshi', 'Maapya Dudhkoshi'],
    Okhaldhunga: ['Siddhicharan', 'Champadevi', 'Chisankhugadhi', 'Khijidemba', 'Likhu', 'Manebhanjyang', 'Molung', 'Sunkoshi'],
    Udayapur: ['Triyuga', 'Katari', 'Belaka', 'Chaudandigadhi', 'Udayapurgadhi', 'Limchungbung', 'Rautamai', 'Sunkoshi', 'Tapli'],
  },

  Madhesh: {
    Saptari: ['Rajbiraj', 'Shambhunath', 'Kanchanrup', 'Khadak', 'Surunga', 'Saptakoshi', 'Dakneshwori', 'Bodebarsain', 'Rupani', 'Balan Bihul', 'Bishnupur', 'Chhinnamasta', 'Mahadeva', 'Rajgadh', 'Tilathi Koiladi', 'Tirhut', 'Hanumannagar Kankalini', 'Agnisair Krishna Savaran'],
    Siraha: ['Lahan', 'Dhangadhimai', 'Siraha', 'Golbazar', 'Mirchaiya', 'Kalyanpur', 'Karjanha', 'Sukhipur', 'Bhagawanpur', 'Aurahi', 'Bishnupur', 'Bariyarpatti', 'Lakshmipur Patari', 'Naraha', 'Sakhuwanankarkatti', 'Arnama', 'Navarajpur'],
    Dhanusha: ['Janakpur', 'Chhireshwarnath', 'Ganeshman Charnath', 'Dhanushadham', 'Nagarain', 'Bideha', 'Mithila', 'Sahidnagar', 'Sabaila', 'Kamala', 'Mithila Bihari', 'Hansapur', 'Janaknandini', 'Bateshwar', 'Mukhiyapatti Musharniya', 'Lakshminiya', 'Aurahi', 'Dhanauji'],
    Mahottari: ['Jaleshwar', 'Bardibas', 'Gaushala', 'Loharpatti', 'Ramgopalpur', 'Manara Shiswa', 'Balwa', 'Aurahi', 'Bhangaha', 'Ekdanra', 'Mahottari', 'Matihani', 'Pipara', 'Samsi', 'Sonama'],
    Sarlahi: ['Malangwa', 'Hariwan', 'Lalbandi', 'Haripur', 'Ishworpur', 'Barahathwa', 'Balara', 'Godaita', 'Bagmati', 'Kabilasi', 'Chakraghatta', 'Chandranagar', 'Dhankaul', 'Brahmapuri', 'Ramnagar', 'Parsa', 'Bishnu', 'Kaudena', 'Basbariya', 'Haripurwa'],
    Rautahat: ['Chandrapur', 'Gaur', 'Baudhimai', 'Brindaban', 'Dewahi Gonahi', 'Durga Bhagwati', 'Gadhimai', 'Garuda', 'Gujara', 'Ishanath', 'Katahariya', 'Madhav Narayan', 'Maulapur', 'Paroha', 'Phatuwa Bijayapur', 'Rajdevi', 'Rajpur', 'Yamunamai'],
    Bara: ['Kalaiya', 'Jitpur Simara', 'Kolhabi', 'Nijgadh', 'Mahagadhimai', 'Simraungadh', 'Pacharauta', 'Pheta', 'Bishrampur', 'Prasauni', 'Adarsha Kotwal', 'Karaiyamai', 'Devtal', 'Parwanipur', 'Baragadhi', 'Suwarna'],
    Parsa: ['Birgunj', 'Pokhariya', 'Bahudarmai', 'Parsagadhi', 'Bindabasini', 'Chhipaharmai', 'Dhobini', 'Jagarnathpur', 'Jirabhawani', 'Kalikamai', 'Pakahamainpur', 'Paterwasugauli', 'Sakhuwaprasauni', 'Thori'],
  },

  Bagmati: {
    Sindhuli: ['Kamalamai', 'Dudhauli', 'Golanjor', 'Ghyanglekh', 'Hariharpurgadhi', 'Marin', 'Phikkal', 'Sunkoshi', 'Tinpatan'],
    Ramechhap: ['Manthali', 'Ramechhap', 'Umakunda', 'Doramba', 'Gokulganga', 'Khandadevi', 'Likhu Tamakoshi', 'Sunapati'],
    Dolakha: ['Bhimeshwar', 'Jiri', 'Baiteshwar', 'Bigu', 'Gaurishankar', 'Kalinchok', 'Melung', 'Sailung', 'Tamakoshi'],
    Sindhupalchok: ['Chautara Sangachokgadhi', 'Melamchi', 'Indrawati', 'Barhabise', 'Balephi', 'Bhotekoshi', 'Helambu', 'Jugal', 'Lisankhu Pakhar', 'Panchpokhari Thangpal', 'Sunkoshi', 'Tripurasundari'],
    Kavrepalanchok: ['Banepa', 'Dhulikhel', 'Panauti', 'Panchkhal', 'Namobuddha', 'Mandandeupur', 'Roshi', 'Temal', 'Bethanchowk', 'Bhumlu', 'Chaurideurali', 'Khanikhola', 'Mahabharat'],
    Lalitpur: ['Lalitpur', 'Godawari', 'Mahalaxmi', 'Bagmati', 'Konjyosom', 'Mahankal'],
    Bhaktapur: ['Bhaktapur', 'Changunarayan', 'Madhyapur Thimi', 'Suryabinayak'],
    Kathmandu: ['Kathmandu', 'Kirtipur', 'Budhanilkantha', 'Chandragiri', 'Dakshinkali', 'Gokarneshwar', 'Kageshwari Manohara', 'Nagarjun', 'Shankharapur', 'Tarakeshwar', 'Tokha'],
    Nuwakot: ['Bidur', 'Belkotgadhi', 'Kakani', 'Dupcheshwar', 'Likhu', 'Meghang', 'Panchakanya', 'Shivapuri', 'Suryagadhi', 'Tadi', 'Tarkeshwar', 'Kispang'],
    Rasuwa: ['Gosaikunda', 'Aamachodingmo', 'Kalika', 'Naukunda', 'Uttargaya'],
    Dhading: ['Dhunibesi', 'Nilkantha', 'Gajuri', 'Galchhi', 'Gangajamuna', 'Jwalamukhi', 'Khaniyabas', 'Netrawati Dabjong', 'Rubi Valley', 'Siddhalek', 'Thakre', 'Tripura Sundari', 'Benighat Rorang'],
    Makwanpur: ['Hetauda', 'Thaha', 'Bagmati', 'Bakaiya', 'Indrasarowar', 'Kailash', 'Makawanpurgadhi', 'Manahari', 'Raksirang'],
    Chitwan: ['Bharatpur', 'Kalika', 'Khairahani', 'Madi', 'Ratnanagar', 'Rapti', 'Ichchhakamana'],
  },

  Gandaki: {
    Gorkha: ['Gorkha', 'Palungtar', 'Sulikot', 'Siranchowk', 'Ajirkot', 'Aarughat', 'Barpak Sulikot', 'Bhimsen Thapa', 'Dharche', 'Gandaki', 'Sahid Lakhan', 'Chum Nubri'],
    Lamjung: ['Besishahar', 'Madhya Nepal', 'Rainas', 'Sundarbazar', 'Dordi', 'Dudhpokhari', 'Kwholasothar', 'Marsyangdi'],
    Tanahun: ['Bhanu', 'Bhimad', 'Byas', 'Shuklagandaki', 'Aanbu Khaireni', 'Devghat', 'Bandipur', 'Ghiring', 'Myagde', 'Rishing'],
    Kaski: ['Pokhara', 'Annapurna', 'Machhapuchchhre', 'Madi', 'Rupa'],
    Manang: ['Chame', 'Nashong', 'Narpa Bhumi', 'Manang Ngisyang'],
    Mustang: ['Gharpajhong', 'Thasang', 'Barhagaun Muktikhsetra', 'Lomanthang', 'Lo-Ghekar Damodarkunda'],
    Myagdi: ['Beni', 'Annapurna', 'Dhaulagiri', 'Malika', 'Mangala', 'Raghuganga'],
    Parbat: ['Kushma', 'Phalebas', 'Jaljala', 'Modi', 'Paiyun', 'Mahashila', 'Bihadi'],
    Baglung: ['Baglung', 'Dhorpatan', 'Galkot', 'Jaimuni', 'Bareng', 'Khathekhola', 'Taman Khola', 'Tara Khola', 'Nisikhola', 'Badigad'],
    Syangja: ['Putalibazar', 'Waling', 'Galyang', 'Chapakot', 'Bhirkot', 'Harinas', 'Kaligandaki', 'Phedikhola', 'Arjun Chaupari', 'Aandhikhola', 'Biruwa'],
    'Nawalpur (Nawalparasi East)': ['Kawasoti', 'Gaindakot', 'Devchuli', 'Madhyabindu', 'Baudikali', 'Bulingtar', 'Binayi Tribeni', 'Hupsekot'],
  },

  Lumbini: {
    'Parasi (Nawalparasi West)': ['Bardaghat', 'Ramgram', 'Sunwal', 'Susta', 'Palhinandan', 'Pratappur', 'Sarawal'],
    Rupandehi: ['Butwal', 'Siddharthanagar', 'Devdaha', 'Lumbini Sanskritik', 'Sainamaina', 'Tilottama', 'Gaidahawa', 'Kanchan', 'Kotahimai', 'Marchawari', 'Mayadevi', 'Omsatiya', 'Rohini', 'Sammarimai', 'Siyari', 'Suddodhan'],
    Kapilvastu: ['Kapilvastu', 'Banganga', 'Buddhabhumi', 'Shivaraj', 'Krishnanagar', 'Maharajgunj', 'Mayadevi', 'Yashodhara', 'Suddhodan', 'Bijaynagar'],
    Palpa: ['Tansen', 'Rampur', 'Rainadevi Chhahara', 'Ribdikot', 'Bagnaskali', 'Mathagadhi', 'Nisdi', 'Purbakhola', 'Rambha', 'Tinau'],
    Arghakhanchi: ['Sandhikharka', 'Sitganga', 'Bhumikasthan', 'Chhatradev', 'Malarani', 'Panini'],
    Gulmi: ['Resunga', 'Musikot', 'Gulmidarbar', 'Satyawati', 'Chandrakot', 'Ruru', 'Chhatrakot', 'Dhurkot', 'Isma', 'Kaligandaki', 'Madane', 'Malika'],
    Pyuthan: ['Pyuthan', 'Sworgadwari', 'Gaumukhi', 'Mandavi', 'Mallarani', 'Naubahini', 'Jhimruk', 'Ayirawati', 'Sarumarani'],
    Rolpa: ['Rolpa', 'Runtigadhi', 'Triveni', 'Sunilsmriti', 'Lungri', 'Gangadev', 'Madi', 'Pariwartan', 'Sunchhahari', 'Thawang'],
    'Eastern Rukum': ['Bhume', 'Putha Uttarganga', 'Sisne'],
    Dang: ['Ghorahi', 'Tulsipur', 'Lamahi', 'Bangalachuli', 'Dangisharan', 'Gadhawa', 'Rajpur', 'Rapti', 'Shantinagar', 'Babai'],
    Banke: ['Nepalgunj', 'Kohalpur', 'Baijanath', 'Duduwa', 'Janaki', 'Khajura', 'Narainapur', 'Rapti Sonari'],
    Bardiya: ['Gulariya', 'Madhuwan', 'Rajapur', 'Thakurbaba', 'Barbardiya', 'Badhaiyatal', 'Geruwa', 'Basgadhi'],
  },

  Karnali: {
    'Western Rukum': ['Musikot', 'Chaurjahari', 'Aathbiskot', 'Banphikot', 'Sani Bheri', 'Triveni'],
    Salyan: ['Shaarda', 'Bagchaur', 'Bangad Kupinde', 'Kalimati', 'Tribeni', 'Kapurkot', 'Chhatreshwari', 'Darma', 'Kumakhmalika', 'Siddha Kumakh'],
    Dolpa: ['Thuli Bheri', 'Tripurasundari', 'Dolpo Buddha', 'Shey Phoksundo', 'Jagadulla', 'Mudkechula', 'Kaike', 'Chharka Tangsong'],
    Humla: ['Simkot', 'Namkha', 'Kharpunath', 'Sarkegad', 'Chankheli', 'Adanchuli', 'Tanjakot'],
    Jumla: ['Chandannath', 'Tatopani', 'Tila', 'Kankasundari', 'Sinja', 'Hima', 'Guthichaur', 'Patarasi'],
    Kalikot: ['Khandachakra', 'Raskot', 'Tilagufa', 'Pachaljharana', 'Sanni Triveni', 'Naraharinath', 'Kalika', 'Mahawai', 'Palata', 'Shubha Kalika'],
    Mugu: ['Chhayanath Rara', 'Mugum Karmarong', 'Soru', 'Khatyad'],
    Surkhet: ['Birendranagar', 'Bheriganga', 'Gurbhakot', 'Panchapuri', 'Lekbeshi', 'Chaukune', 'Barahtal', 'Chingad', 'Simta'],
    Dailekh: ['Narayan', 'Dullu', 'Chamunda Bindrasaini', 'Aathabis', 'Bhagawatimai', 'Gurans', 'Dungeshwar', 'Naumule', 'Mahabu', 'Bhairabi', 'Thantikandh'],
    Jajarkot: ['Bheri', 'Chhedagad', 'Nalgad', 'Barekot', 'Kushe', 'Junichande', 'Shivalaya'],
  },

  Sudurpashchim: {
    Kailali: ['Dhangadhi', 'Tikapur', 'Ghodaghodi', 'Lamkichuha', 'Bhajani', 'Godawari', 'Gauriganga', 'Janaki', 'Joshipur', 'Kailari', 'Mohanyal', 'Chure', 'Bardagoriya'],
    Achham: ['Mangalsen', 'Kamalbazar', 'Sanphebagar', 'Panchadewal Binayak', 'Chaurpati', 'Dhakari', 'Bannigadi Jayagad', 'Mellekh', 'Ramaroshan', 'Turmakhad'],
    Doti: ['Dipayal Silgadhi', 'Shikhar', 'Aadarsha', 'Purbichauki', 'K.I. Singh', 'Jorayal', 'Sayal', 'Bogtan Phudsil', 'Badikedar'],
    Bajhang: ['Jaya Prithvi', 'Bungal', 'Talkot', 'Masta', 'Khaptad Chhanna', 'Thalara', 'Bitthadchir', 'Surma', 'Chhabis Pathibhera', 'Durgathali', 'Kedarsyu', 'Saipal'],
    Bajura: ['Badimalika', 'Triveni', 'Budhiganga', 'Budhinanda', 'Gaumul', 'Jagannath', 'Swami Kartik Khapar', 'Khaptad Chhededaha', 'Himali'],
    Kanchanpur: ['Bhimdatta', 'Punarbas', 'Bedkot', 'Mahakali', 'Shuklaphanta', 'Belauri', 'Krishnapur', 'Laljhadi', 'Beldandi'],
    Dadeldhura: ['Amargadhi', 'Parashuram', 'Aalitaal', 'Bhageshwar', 'Ganyapadhura', 'Nawadurga', 'Ajaymeru'],
    Baitadi: ['Dasharathchand', 'Patan', 'Melauli', 'Purchaudi', 'Dogdakedar', 'Dilasaini', 'Sigas', 'Pancheshwar', 'Surnaya', 'Shivanath'],
    Darchula: ['Mahakali', 'Shailyashikhar', 'Naugad', 'Malikarjun', 'Byas', 'Duhun', 'Lekam', 'Api Himal', 'Marma'],
  },
};

/** The 7 provinces. */
function getProvinces(): string[] {
  return Object.keys(NEPAL_ADDRESS);
}

/** Districts of one province (empty list if the province is empty or unknown). */
function getDistricts(province: string): string[] {
  return Object.keys(NEPAL_ADDRESS[province] ?? {});
}

/** Cities / municipalities of one district (empty list when there is no data). */
function getCities(province: string, district: string): string[] {
  return NEPAL_ADDRESS[province]?.[district] ?? [];
}

const PLACEHOLDER = '/images/product-placeholder.svg';

const initialForm = {
  fullName: '',
  phone: '',
  province: '',
  district: '',
  city: '',
  street: '',
  postalCode: '',
};
type FormState = typeof initialForm;
type FormKey = keyof FormState;

const REQUIRED_FIELDS: FormKey[] = [
  'fullName',
  'phone',
  'province',
  'district',
  'city',
  'street',
  'postalCode',
];

/* =====================================================================
 * PAGE
 * ===================================================================== */
export default function CheckoutPage() {
  const router = useRouter();
  const { cart, error, clear } = useCart();
  const [form, setForm] = useState(initialForm);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash_on_delivery'>(
    'cash_on_delivery',
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [signals, setSignals] = useState({ district: 0, city: 0 });

  // The cart hook fills the cart in an effect; wait one tick so we don't flash the empty state.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);

  const alertRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (message || error) {
      alertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [message, error]);

  function update(key: FormKey, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const invalid = (key: FormKey) => attempted && !form[key].trim();

  const districts = getDistricts(form.province);
  const cities = getCities(form.province, form.district);

  function selectProvince(value: string) {
    if (value === form.province) return;
    setForm((current) => ({ ...current, province: value, district: '', city: '' }));
    setSignals((current) => ({ ...current, district: current.district + 1 }));
  }

  function selectDistrict(value: string) {
    if (value === form.district) return;
    setForm((current) => ({ ...current, district: value, city: '' }));
    setSignals((current) => ({ ...current, city: current.city + 1 }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setAttempted(true);

    if (REQUIRED_FIELDS.some((key) => !form[key].trim())) {
      setMessage('Please fill in all the required fields.');
      requestAnimationFrame(() => {
        document
          .querySelector('[aria-invalid="true"]')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && localStorage.getItem('socio-user-token')
            ? { 'x-user-token': localStorage.getItem('socio-user-token')! }
            : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          shippingAddress: form,
          paymentMethod,
          items: cart.items.map(({ productId, quantity, selectedVariantId }) => ({
            productId,
            quantity,
            selectedVariantId,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      clear();
      router.push(`/order-success/${data.order.id}`);
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'Unable to place order.');
    } finally {
      setLoading(false);
    }
  }

  const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
  const currency = cart.items[0]?.currency ?? '';
  const hasUnavailable = cart.items.some((item) => item.unavailable);
  const placeOrderDisabled = loading || hasUnavailable;

  if (!ready) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <PageHeader />
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-5">
            {[0, 1, 2].map((key) => (
              <div key={key} className="h-48 animate-pulse rounded-3xl bg-secondary" />
            ))}
          </div>
          <div className="hidden h-80 animate-pulse rounded-3xl bg-secondary lg:block" />
        </div>
      </main>
    );
  }

  if (!cart.items.length) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="size-8" />
          </span>
          <h1 className="mt-5 text-2xl font-bold">Your cart is empty</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Add a few products to your cart and come back here to check out.
          </p>
          <Button asChild className="mt-6 h-11 px-6">
            <Link href="/marketplace">Browse products</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <PageHeader />

      <form
        onSubmit={submit}
        noValidate
        className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]"
      >
        {/* ============ Left: form ============ */}
        <div className="space-y-5">
          {(message || error) && (
            <div
              ref={alertRef}
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              {message || error}
            </div>
          )}

          {hasUnavailable && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
              <p className="text-foreground">
                Some items are unavailable or exceed current stock.{' '}
                <Link href="/cart" className="font-semibold text-primary hover:underline">
                  Update your cart
                </Link>{' '}
                to place the order.
              </p>
            </div>
          )}

          {/* Contact */}
          <Section number={1} icon={UserRound} title="Contact details" text="So the rider can reach you.">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                id="fullName"
                label="Full name"
                value={form.fullName}
                onChange={(value) => update('fullName', value)}
                invalid={invalid('fullName')}
                placeholder="Your full name"
                autoComplete="name"
              />
              <TextField
                id="phone"
                label="Phone number"
                value={form.phone}
                onChange={(value) => update('phone', value)}
                invalid={invalid('phone')}
                placeholder="98XXXXXXXX"
                autoComplete="tel"
                inputMode="tel"
              />
            </div>
          </Section>

          {/* Address */}
          <Section
            number={2}
            icon={MapPin}
            title="Delivery address"
            text="Choose from the lists, or type it if yours is not listed."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <AddressSelect
                label="Province"
                value={form.province}
                options={getProvinces()}
                placeholder="Select province"
                allowCustom
                required
                invalid={invalid('province')}
                onChange={selectProvince}
              />

              {form.province && districts.length === 0 ? (
                <TextField
                  id="district"
                  label="District"
                  value={form.district}
                  onChange={(value) => update('district', value)}
                  invalid={invalid('district')}
                  placeholder="Type your district"
                />
              ) : (
                <AddressSelect
                  label="District"
                  value={form.district}
                  options={districts}
                  placeholder="Select district"
                  disabled={!form.province}
                  disabledText="Select a province first"
                  openSignal={signals.district}
                  allowCustom
                  required
                  invalid={invalid('district')}
                  hint={form.province ? 'Not in the list? Type it and choose "Use ...".' : undefined}
                  onChange={selectDistrict}
                />
              )}

              {form.district && cities.length === 0 ? (
                <TextField
                  id="city"
                  label="City / Municipality"
                  value={form.city}
                  onChange={(value) => update('city', value)}
                  invalid={invalid('city')}
                  placeholder="Type your city or municipality"
                />
              ) : (
                <AddressSelect
                  label="City / Municipality"
                  value={form.city}
                  options={cities}
                  placeholder="Select city or municipality"
                  disabled={!form.district}
                  disabledText="Select a district first"
                  openSignal={signals.city}
                  allowCustom
                  required
                  invalid={invalid('city')}
                  hint={form.district ? 'Not in the list? Type it and choose "Use ...".' : undefined}
                  onChange={(value) => update('city', value)}
                />
              )}

              <TextField
                id="postalCode"
                label="Postal code"
                value={form.postalCode}
                onChange={(value) => update('postalCode', value)}
                invalid={invalid('postalCode')}
                placeholder="e.g. 44600"
                autoComplete="postal-code"
                inputMode="numeric"
              />

              <div className="sm:col-span-2">
                <TextField
                  id="street"
                  label="Street address"
                  value={form.street}
                  onChange={(value) => update('street', value)}
                  invalid={invalid('street')}
                  placeholder="Tole, street, house number, nearby landmark"
                  autoComplete="street-address"
                />
              </div>
            </div>
          </Section>

          {/* Payment */}
          <Section
            number={3}
            icon={CreditCard}
            title="Payment method"
            text="Payment stays pending until it is confirmed."
          >
            <div role="radiogroup" aria-label="Payment method" className="grid gap-3 sm:grid-cols-2">
              <PaymentOption
                icon={Banknote}
                title="Cash on delivery"
                text="Pay in cash when your order arrives."
                checked={paymentMethod === 'cash_on_delivery'}
                onSelect={() => setPaymentMethod('cash_on_delivery')}
              />
              <PaymentOption
                icon={CreditCard}
                title="Online payment"
                text="Pay securely with eSewa, Khalti or bank transfer."
                checked={paymentMethod === 'online'}
                onSelect={() => setPaymentMethod('online')}
              />
            </div>
          </Section>
        </div>

        {/* ============ Right: summary ============ */}
        <aside className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:sticky lg:top-32">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Order summary</h2>
            <Link href="/cart" className="text-xs font-semibold text-primary hover:underline">
              Edit cart
            </Link>
          </div>

          <ul className="mt-5 max-h-72 space-y-3.5 pr-1">
            {cart.items.map((item) => (
              <li
                key={`${item.productId}-${item.selectedVariantId}`}
                className="flex items-center gap-3"
              >
                <div className="relative size-14 shrink-0 rounded-xl bg-muted/50 p-1.5">
                  <img
                    src={item.images?.[0] || PLACEHOLDER}
                    alt=""
                    loading="lazy"
                    onError={(event) => {
                      if (!event.currentTarget.src.endsWith('product-placeholder.svg')) {
                        event.currentTarget.src = PLACEHOLDER;
                      }
                    }}
                    className="size-full object-contain mix-blend-multiply dark:mix-blend-normal"
                  />
                  <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                    {item.quantity}
                  </span>
                </div>
                <p
                  className={`line-clamp-2 min-w-0 flex-1 text-sm font-medium leading-5 ${
                    item.unavailable ? 'text-destructive' : ''
                  }`}
                >
                  {item.name}
                </p>
                <span className="text-sm font-semibold tabular-nums">
                  {item.subtotal.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </dt>
              <dd className="font-semibold tabular-nums">
                {currency} {cart.subtotal.toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="font-semibold text-success">Free</dd>
            </div>
          </dl>

          <div className="mt-5 flex items-end justify-between border-t border-border pt-5">
            <span className="font-semibold">Total</span>
            <strong className="text-2xl font-bold tabular-nums">
              {currency} {cart.subtotal.toLocaleString()}
            </strong>
          </div>

          <Button
            type="submit"
            className="mt-6 hidden h-12 w-full text-sm font-semibold lg:inline-flex"
            disabled={placeOrderDisabled}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Placing order...
              </>
            ) : (
              <>
                <Lock className="size-4" /> Place order
              </>
            )}
          </Button>

          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Shipping is currently free. Payment remains pending until confirmed.
          </p>

          <ul className="mt-5 space-y-2.5 border-t border-border pt-5 text-xs font-medium text-muted-foreground">
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="size-4 text-primary" /> Secure checkout
            </li>
            <li className="flex items-center gap-2.5">
              <Truck className="size-4 text-primary" /> Tracked delivery
            </li>
          </ul>
        </aside>

        {/* Phones: sticky place-order bar (stops at the end of the form, never covers the footer) */}
        <div className="sticky bottom-0 z-20 -mx-4 border-t border-border bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold tabular-nums">
                {currency} {cart.subtotal.toLocaleString()}
              </p>
            </div>
            <Button
              type="submit"
              className="h-12 flex-1 text-sm font-semibold sm:max-w-xs"
              disabled={placeOrderDisabled}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Placing...
                </>
              ) : (
                'Place order'
              )}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}

/* =====================================================================
 * SMALL PIECES
 * ===================================================================== */
function PageHeader() {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:text-sm">
          Secure order setup
        </p>
        <h1 className="mt-1.5 text-2xl font-bold sm:text-3xl">Checkout</h1>
      </div>

      <ol className="flex items-center gap-2 text-xs font-semibold sm:gap-3">
        <li className="flex items-center gap-2 text-muted-foreground">
          <span className="flex size-6 items-center justify-center rounded-full bg-success text-success-foreground">
            <Check className="size-3.5" />
          </span>
          Cart
        </li>
        <span className="h-px w-5 bg-border sm:w-8" />
        <li className="flex items-center gap-2 text-foreground">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
            2
          </span>
          Checkout
        </li>
        <span className="h-px w-5 bg-border sm:w-8" />
        <li className="flex items-center gap-2 text-muted-foreground">
          <span className="flex size-6 items-center justify-center rounded-full border border-border">
            3
          </span>
          Done
        </li>
      </ol>
    </div>
  );
}

function Section({
  number,
  icon: Icon,
  title,
  text,
  children,
}: {
  number: number;
  icon: LucideIcon;
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold leading-tight">
            <span className="mr-2 text-primary">{number}.</span>
            {title}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{text}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  invalid,
  placeholder,
  autoComplete,
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        <span className="ml-1 text-destructive">*</span>
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={invalid}
        className={`h-11 ${invalid ? 'border-destructive' : ''}`}
      />
      {invalid && <p className="text-xs font-medium text-destructive">This field is required.</p>}
    </div>
  );
}

function PaymentOption({
  icon: Icon,
  title,
  text,
  checked,
  onSelect,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`relative flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/50 ${
        checked
          ? 'border-primary bg-primary/5 ring-1 ring-primary'
          : 'border-border bg-background hover:border-primary/50'
      }`}
    >
      <input
        type="radio"
        name="payment"
        checked={checked}
        onChange={onSelect}
        className="sr-only"
      />
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
          checked ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
        }`}
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{title}</span>
        <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{text}</span>
      </span>
      <span
        aria-hidden
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
          checked ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
        }`}
      >
        {checked && <Check className="size-3" />}
      </span>
    </label>
  );
}

/* ---------------------------------------------------------------------
 * ADDRESS SELECT  (searchable dropdown, keyboard friendly)
 * - Click or Enter opens the list. Type to filter. Arrow keys + Enter select. Escape closes.
 * - Search box is only shown for long lists (or when custom values are allowed).
 * - Opens upward when there is not enough room below.
 * - `openSignal`: when this number changes the list opens (used to auto-advance province > district > city).
 * --------------------------------------------------------------------- */
function AddressSelect({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled = false,
  disabledText,
  required = false,
  hint,
  allowCustom = false,
  openSignal = 0,
  invalid = false,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  disabledText?: string;
  required?: boolean;
  hint?: string;
  allowCustom?: boolean;
  openSignal?: number;
  invalid?: boolean;
}) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const lastSignal = useRef(openSignal);

  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const showSearch = options.length > 7 || allowCustom;
  const q = query.trim().toLowerCase();
  const filtered = q ? options.filter((option) => option.toLowerCase().includes(q)) : options;
  const customValue =
    allowCustom && q && !options.some((option) => option.toLowerCase() === q) ? query.trim() : null;
  const items: { label: string; value: string; custom?: boolean }[] = [
    ...filtered.map((option) => ({ label: option, value: option })),
    ...(customValue ? [{ label: `Use "${customValue}"`, value: customValue, custom: true }] : []),
  ];

  function openPanel() {
    if (disabled) return;
    const rect = rootRef.current?.getBoundingClientRect();
    if (rect) setDropUp(window.innerHeight - rect.bottom < 300 && rect.top > 300);
    setQuery('');
    setActive(Math.max(0, options.indexOf(value)));
    setOpen(true);
  }

  function closePanel(returnFocus = false) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  function choose(next: string) {
    onChange(next);
    closePanel(true);
  }

  // Auto-open when the parent bumps the signal (after the previous dropdown was chosen).
  useEffect(() => {
    if (openSignal !== lastSignal.current) {
      lastSignal.current = openSignal;
      if (!disabled) openPanel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSignal, disabled]);

  // Focus: search box on mouse devices (no surprise keyboard on phones), otherwise the panel.
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      const finePointer = window.matchMedia('(pointer: fine)').matches;
      if (showSearch && finePointer) searchRef.current?.focus();
      else panelRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [open, showSearch]);

  // Close on outside press.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Keep the highlighted row visible.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [active, open, query]);

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((current) => Math.min(current + 1, items.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      const item = items[active];
      if (item) choose(item.value);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closePanel(true);
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  }

  return (
    <div className="space-y-2" ref={rootRef}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>

      <div className="relative">
        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-invalid={invalid}
          onClick={() => (open ? closePanel() : openPanel())}
          className={`flex h-11 w-full items-center justify-between gap-2 rounded-md border bg-background px-3 text-left text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-70 ${
            open ? 'border-ring ring-3 ring-ring/30' : invalid ? 'border-destructive' : 'border-input'
          }`}
        >
          <span
            className={`truncate ${value ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            {value || (disabled && disabledText ? disabledText : placeholder)}
          </span>
          <ChevronDown
            className={`size-4 shrink-0 text-muted-foreground transition-transform ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>

        {open && (
          <div
            ref={panelRef}
            tabIndex={-1}
            onKeyDown={onKeyDown}
            className={`absolute z-30 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-xl outline-none animate-in fade-in duration-150 motion-reduce:animate-none ${
              dropUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
            }`}
          >
            {showSearch && (
              <div className="flex items-center gap-2 border-b border-border px-3">
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActive(0);
                  }}
                  placeholder={`Search ${label.toLowerCase()}`}
                  aria-label={`Search ${label}`}
                  className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            )}

            <ul ref={listRef} role="listbox" aria-label={label} className="max-h-60 overflow-y-auto p-1">
              {items.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No matches found
                </li>
              )}
              {items.map((item, index) => {
                const selected = item.value === value && !item.custom;
                return (
                  <li
                    key={`${item.value}-${item.custom ? 'custom' : 'option'}`}
                    role="option"
                    aria-selected={selected}
                    data-active={index === active}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => choose(item.value)}
                    className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm ${
                      index === active ? 'bg-secondary text-foreground' : 'text-foreground'
                    } ${item.custom ? 'font-semibold text-primary' : ''}`}
                  >
                    <span className="truncate">{item.label}</span>
                    {selected && <Check className="size-4 shrink-0 text-primary" />}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {invalid ? (
        <p className="text-xs font-medium text-destructive">This field is required.</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
