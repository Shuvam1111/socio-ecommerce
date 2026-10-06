'use client';

/**
 * =====================================================================
 * VENDOR REGISTRATION  (step-by-step wizard, same logic as the MVP form)
 * =====================================================================
 * STEPS: 1 Account, 2 Store, 3 Business, 4 Address, 5 Pickup and return, 6 Review and submit
 *
 * NOTES FOR ANOTHER AI / DEVELOPER:
 *   1. LOGIC IS UNCHANGED: same form state (VendorRegistrationData), same validation rules and
 *      messages in the same order, same registerVendor() call, same success/error toasts, and the
 *      form is reset to initialForm after a successful submit.
 *   2. The original validate() is split per step (validateAccount, validateStore, ...). Continue
 *      runs the current step's validator. Final submit runs ALL validators in the original order,
 *      and jumps back to the step that has the problem.
 *   3. The page file (/register/vendor) does not need changes. It still renders <VendorRegistrationForm />.
 *   4. UI-only conveniences (no data/logic change): password show/hide, business type quick picks,
 *      "use business/pickup address" copy buttons, review step, success screen.
 *   4b. ADDRESS PICKERS: Province > District > City are cascading searchable dropdowns fed by
 *      the NEPAL_ADDRESS data block in this same file (getProvinces/getDistricts/getCities).
 *      Changing a parent clears the
 *      children. City accepts a typed value that is not in the list, and becomes a text box for a
 *      district with no data. The stored values are still plain strings in the same form fields.
 *   5. The duplicate "Primary Phone" field (it edited the same `phone` value as Account) was removed.
 *      "Alternate Phone" moved into the Business step.
 *   6. Colors use theme tokens only. Do not hardcode colors.
 */

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  ClipboardCheck,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  Pencil,
  Search,
  Store,
  Truck,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { registerVendor } from '../services/vendor-service';
import type { VendorRegistrationData } from '../types/vendor';

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

const initialForm: VendorRegistrationData = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',

  storeName: '',
  storeDescription: '',

  businessType: '',
  legalName: '',
  registrationNumber: '',
  panNumber: '',
  vatRegistered: false,

  alternatePhone: '',

  province: '',
  district: '',
  city: '',
  street: '',
  postalCode: '',

  pickupProvince: '',
  pickupDistrict: '',
  pickupCity: '',
  pickupStreet: '',

  returnProvince: '',
  returnDistrict: '',
  returnCity: '',
  returnStreet: '',
};

/* ---------------------------------------------------------------------
 * VALIDATION  (the original validate(), split by step, same order and messages)
 * --------------------------------------------------------------------- */
type Form = VendorRegistrationData;

function validateAccount(form: Form): string | null {
  if (!form.firstName.trim()) return 'First name is required.';
  if (!form.lastName.trim()) return 'Last name is required.';
  if (!form.username.trim()) return 'Username is required.';
  if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
    return 'Username can only contain letters, numbers, and underscores.';
  }
  if (!form.email.trim()) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email address.';
  if (!form.phone.trim()) return 'Phone number is required.';
  if (!/^[0-9+\-\s]{7,15}$/.test(form.phone)) return 'Please enter a valid phone number.';
  if (form.password.length < 8) return 'Password must contain at least 8 characters.';
  if (form.password !== form.confirmPassword) return 'Passwords do not match.';
  return null;
}

function validateStore(form: Form): string | null {
  if (!form.storeName.trim()) return 'Store name is required.';
  return null;
}

function validateBusiness(form: Form): string | null {
  if (!form.businessType.trim()) return 'Business type is required.';
  if (!form.legalName.trim()) return 'Legal business name is required.';
  if (!form.panNumber.trim()) return 'PAN number is required.';
  return null;
}

function validateAddress(form: Form): string | null {
  if (!form.province.trim()) return 'Province is required.';
  if (!form.district.trim()) return 'District is required.';
  if (!form.city.trim()) return 'City is required.';
  if (!form.street.trim()) return 'Street address is required.';
  return null;
}

function validatePickupReturn(form: Form): string | null {
  if (!form.pickupProvince.trim()) return 'Pickup province is required.';
  if (!form.pickupDistrict.trim()) return 'Pickup district is required.';
  if (!form.pickupCity.trim()) return 'Pickup city is required.';
  if (!form.pickupStreet.trim()) return 'Pickup street is required.';
  if (!form.returnProvince.trim()) return 'Return province is required.';
  if (!form.returnDistrict.trim()) return 'Return district is required.';
  if (!form.returnCity.trim()) return 'Return city is required.';
  if (!form.returnStreet.trim()) return 'Return street is required.';
  return null;
}

type StepDef = {
  id: string;
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
  validate: (form: Form) => string | null;
};

const STEPS: StepDef[] = [
  {
    id: 'account',
    label: 'Account',
    title: 'Create your account',
    description: 'Create the account you will use to manage your vendor business.',
    icon: UserRound,
    validate: validateAccount,
  },
  {
    id: 'store',
    label: 'Store',
    title: 'Tell us about your store',
    description: 'Provide the basic information about your online store.',
    icon: Store,
    validate: validateStore,
  },
  {
    id: 'business',
    label: 'Business',
    title: 'Business details',
    description: 'Provide your legal and business registration details.',
    icon: Building2,
    validate: validateBusiness,
  },
  {
    id: 'address',
    label: 'Address',
    title: 'Business address',
    description: 'Provide your main business location.',
    icon: MapPin,
    validate: validateAddress,
  },
  {
    id: 'logistics',
    label: 'Pickup and return',
    title: 'Pickup and return',
    description: 'Where we collect your products, and where returns should be sent.',
    icon: Truck,
    validate: validatePickupReturn,
  },
  {
    id: 'review',
    label: 'Review',
    title: 'Review and submit',
    description: 'Check everything once. You can edit any section before submitting.',
    icon: ClipboardCheck,
    validate: () => null,
  },
];

const LAST_STEP = STEPS.length - 1;

/** Runs every validator in the original order. Returns the first error and its step. */
function validateAll(form: Form): { error: string; step: number } | null {
  for (let i = 0; i < STEPS.length; i += 1) {
    const error = STEPS[i].validate(form);
    if (error) return { error, step: i };
  }
  return null;
}

/* ---------------------------------------------------------------------
 * ADDRESS KEY MAP  (which form field belongs to which address block)
 * --------------------------------------------------------------------- */
type AddressKind = 'business' | 'pickup' | 'return';
type Key = keyof VendorRegistrationData;
type AddressKeys = { province: Key; district: Key; city: Key; street: Key };

const ADDRESS_KEYS: Record<AddressKind, AddressKeys> = {
  business: { province: 'province', district: 'district', city: 'city', street: 'street' },
  pickup: {
    province: 'pickupProvince',
    district: 'pickupDistrict',
    city: 'pickupCity',
    street: 'pickupStreet',
  },
  return: {
    province: 'returnProvince',
    district: 'returnDistrict',
    city: 'returnCity',
    street: 'returnStreet',
  },
};

const str = (form: Form, key: Key) => String(form[key] ?? '');

const BUSINESS_TYPES = ['Individual', 'Sole proprietorship', 'Partnership', 'Pvt. Ltd.'];

/* ---------------------------------------------------------------------
 * MAIN COMPONENT
 * --------------------------------------------------------------------- */
export function VendorRegistrationForm() {
  const [form, setForm] = useState<VendorRegistrationData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submittedStore, setSubmittedStore] = useState<string | null>(null);

  const topRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step, submittedStore]);

  function updateField(field: keyof VendorRegistrationData, value: string | boolean) {
    setStepError(null);
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function copyAddress(from: AddressKind, to: AddressKind) {
    const source = ADDRESS_KEYS[from];
    const target = ADDRESS_KEYS[to];
    (Object.keys(target) as (keyof AddressKeys)[]).forEach((part) => {
      updateField(target[part], str(form, source[part]));
    });
  }

  function handleNext() {
    const error = STEPS[step].validate(form);
    if (error) {
      setStepError(error);
      return;
    }
    setStepError(null);
    setStep((current) => Math.min(current + 1, LAST_STEP));
  }

  function handleBack() {
    setStepError(null);
    setStep((current) => Math.max(current - 1, 0));
  }

  function goTo(target: number) {
    setStepError(null);
    setStep(target);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Enter key on an earlier step behaves like "Continue", not "Submit".
    if (step < LAST_STEP) {
      handleNext();
      return;
    }

    const failure = validateAll(form);

    if (failure) {
      setStep(failure.step);
      setStepError(failure.error);
      toast.error(failure.error);
      return;
    }

    setIsSubmitting(true);

    try {
      const vendor = await registerVendor(form);

      toast.success('Vendor registration submitted successfully.', {
        description: `${vendor.store.name} is waiting for admin approval.`,
      });

      setSubmittedStore(vendor.store.name);
      setForm(initialForm);
      setStep(0);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to register vendor. Please try again.';

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const current = STEPS[step];
  const StepIcon = current.icon;

  if (submittedStore) {
    return (
      <div ref={topRef} className="mx-auto w-full max-w-3xl scroll-mt-32">
        <SuccessPanel storeName={submittedStore} />
      </div>
    );
  }

  return (
    <div ref={topRef} className="mx-auto w-full max-w-6xl scroll-mt-32">
      <div className="grid rounded-3xl border border-border bg-card shadow-lg lg:grid-cols-[21rem_minmax(0,1fr)]">
        {/* ============ Left / top panel: brand + progress ============ */}
        <aside className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-primary via-primary to-primary/70 p-5 text-primary-foreground sm:p-8 lg:flex lg:flex-col lg:rounded-l-3xl lg:rounded-tr-none lg:p-10">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -right-24 -top-24 size-72 rounded-full border border-current opacity-20" />
            <div className="absolute -right-8 -top-8 size-44 rounded-full border border-current opacity-20" />
            <div className="absolute -bottom-24 -left-16 size-72 rounded-full bg-current opacity-[0.07] blur-3xl" />
            <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:22px_22px]" />
          </div>

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">
              Sell on Socio
            </p>
            <h1 className="mt-2 text-2xl font-bold leading-tight lg:text-3xl">
              Open your shop in a few quick steps
            </h1>
            <p className="mt-3 hidden text-sm leading-6 text-primary-foreground/80 lg:block">
              Register your business to start selling on Socio Commerce. Your application will be
              reviewed by an administrator.
            </p>

            {/* Phones: compact segmented progress */}
            <div className="mt-5 lg:hidden">
              <div className="flex gap-1.5">
                {STEPS.map((s, i) => (
                  <span
                    key={s.id}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                      i <= step ? 'bg-primary-foreground' : 'bg-primary-foreground/25'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs font-medium text-primary-foreground/80">
                Step {step + 1} of {STEPS.length} · {current.label}
              </p>
            </div>

            {/* Desktop: vertical stepper */}
            <ol className="mt-8 hidden space-y-1 lg:block">
              {STEPS.map((s, i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => done && goTo(i)}
                      disabled={!done}
                      aria-current={active ? 'step' : undefined}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                        active
                          ? 'bg-primary-foreground/15 font-semibold'
                          : done
                            ? 'text-primary-foreground hover:bg-primary-foreground/10'
                            : 'text-primary-foreground/55'
                      }`}
                    >
                      <span
                        className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                          done
                            ? 'border-transparent bg-primary-foreground text-primary'
                            : active
                              ? 'border-primary-foreground'
                              : 'border-primary-foreground/40'
                        }`}
                      >
                        {done ? <Check className="size-4" /> : i + 1}
                      </span>
                      {s.label}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <ul className="relative mt-auto hidden space-y-3 pt-8 text-sm text-primary-foreground/85 lg:block">
            {(
              [
                [Users, 'Creators and affiliates promote your products'],
                [Wallet, 'Wallet and coin rewards built in'],
                [Truck, 'Logistics, tracking and rider dispatch included'],
              ] as [LucideIcon, string][]
            ).map(([Icon, text]) => (
              <li key={text} className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15">
                  <Icon className="size-4" />
                </span>
                <span className="pt-1">{text}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* ============ Form area ============ */}
        <form onSubmit={handleSubmit} noValidate className="flex min-w-0 flex-col p-5 sm:p-8 lg:p-10">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <StepIcon className="size-6" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Step {step + 1} of {STEPS.length}
              </p>
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">{current.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{current.description}</p>
            </div>
          </div>

          <div className="mt-5 hidden h-1.5 overflow-hidden rounded-full bg-secondary lg:block">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>

          {stepError && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
            >
              {stepError}
            </div>
          )}

          {/* Step content (re-mounts on every step so the enter animation plays) */}
          <div
            key={current.id}
            className="mt-6 flex-1 animate-in fade-in slide-in-from-right-4 duration-300 motion-reduce:animate-none"
          >
            {current.id === 'account' && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="First Name"
                  value={form.firstName}
                  autoComplete="given-name"
                  onChange={(value) => updateField('firstName', value)}
                  required
                />
                <Field
                  label="Last Name"
                  value={form.lastName}
                  autoComplete="family-name"
                  onChange={(value) => updateField('lastName', value)}
                  required
                />
                <Field
                  label="Username"
                  value={form.username}
                  placeholder="e.g. ramstore"
                  hint="Letters, numbers and underscores only."
                  autoComplete="username"
                  onChange={(value) => updateField('username', value.toLowerCase())}
                  required
                />
                <Field
                  label="Email"
                  type="email"
                  value={form.email}
                  autoComplete="email"
                  inputMode="email"
                  onChange={(value) => updateField('email', value)}
                  required
                />
                <Field
                  label="Phone"
                  value={form.phone}
                  placeholder="98XXXXXXXX"
                  autoComplete="tel"
                  inputMode="tel"
                  onChange={(value) => updateField('phone', value)}
                  required
                />
                <div className="hidden sm:block" />
                <Field
                  label="Password"
                  type="password"
                  value={form.password}
                  hint="At least 8 characters."
                  autoComplete="new-password"
                  onChange={(value) => updateField('password', value)}
                  required
                />
                <Field
                  label="Confirm Password"
                  type="password"
                  value={form.confirmPassword}
                  autoComplete="new-password"
                  onChange={(value) => updateField('confirmPassword', value)}
                  required
                />
              </div>
            )}

            {current.id === 'store' && (
              <div className="space-y-5">
                <Field
                  label="Store Name"
                  value={form.storeName}
                  placeholder="e.g. Ram Electronics"
                  onChange={(value) => updateField('storeName', value)}
                  required
                />
                <div className="space-y-2">
                  <Label htmlFor="storeDescription">Store Description</Label>
                  <textarea
                    id="storeDescription"
                    value={form.storeDescription}
                    onChange={(event) => updateField('storeDescription', event.target.value)}
                    placeholder="Describe your store and products..."
                    rows={5}
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                </div>
              </div>
            )}

            {current.id === 'business' && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Field
                    label="Business Type"
                    value={form.businessType}
                    placeholder="e.g. Individual, Partnership, Pvt. Ltd."
                    onChange={(value) => updateField('businessType', value)}
                    required
                  />
                  <div className="flex flex-wrap gap-2">
                    {BUSINESS_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => updateField('businessType', type)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          form.businessType === type
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <Field
                  label="Legal Name"
                  value={form.legalName}
                  placeholder="Registered legal business name"
                  onChange={(value) => updateField('legalName', value)}
                  required
                />
                <Field
                  label="Registration Number"
                  value={form.registrationNumber}
                  placeholder="e.g. REG-123456"
                  onChange={(value) => updateField('registrationNumber', value)}
                />
                <Field
                  label="PAN Number"
                  value={form.panNumber}
                  placeholder="Enter PAN number"
                  inputMode="numeric"
                  onChange={(value) => updateField('panNumber', value)}
                  required
                />
                <Field
                  label="Alternate Phone"
                  value={form.alternatePhone}
                  hint="Optional. A second number we can reach you on."
                  inputMode="tel"
                  onChange={(value) => updateField('alternatePhone', value)}
                />
                <label
                  htmlFor="vatRegistered"
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-4 transition hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5 sm:col-span-2"
                >
                  <input
                    id="vatRegistered"
                    type="checkbox"
                    checked={form.vatRegistered}
                    onChange={(event) => updateField('vatRegistered', event.target.checked)}
                    className="size-4 rounded border-input accent-primary"
                  />
                  <span>
                    <span className="block text-sm font-medium text-foreground">
                      Business is VAT registered
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Tick this if your business has a VAT registration.
                    </span>
                  </span>
                </label>
              </div>
            )}

            {current.id === 'address' && (
              <AddressFields
                kind="business"
                form={form}
                onChange={updateField}
                includePostalCode
              />
            )}

            {current.id === 'logistics' && (
              <div className="space-y-8">
                <AddressBlock
                  title="Pickup address"
                  description="Where products will be collected."
                  actions={
                    <MiniAction onClick={() => copyAddress('business', 'pickup')}>
                      Same as business address
                    </MiniAction>
                  }
                >
                  <AddressFields kind="pickup" form={form} onChange={updateField} />
                </AddressBlock>

                <AddressBlock
                  title="Return address"
                  description="Where returned products should be sent."
                  actions={
                    <>
                      <MiniAction onClick={() => copyAddress('business', 'return')}>
                        Same as business address
                      </MiniAction>
                      <MiniAction onClick={() => copyAddress('pickup', 'return')}>
                        Same as pickup address
                      </MiniAction>
                    </>
                  }
                >
                  <AddressFields kind="return" form={form} onChange={updateField} />
                </AddressBlock>
              </div>
            )}

            {current.id === 'review' && (
              <div className="space-y-4">
                <ReviewCard title="Account" onEdit={() => goTo(0)}>
                  <ReviewRow label="Name" value={`${form.firstName} ${form.lastName}`.trim()} />
                  <ReviewRow label="Username" value={form.username} />
                  <ReviewRow label="Email" value={form.email} />
                  <ReviewRow label="Phone" value={form.phone} />
                </ReviewCard>

                <ReviewCard title="Store" onEdit={() => goTo(1)}>
                  <ReviewRow label="Store name" value={form.storeName} />
                  <ReviewRow label="Description" value={form.storeDescription} />
                </ReviewCard>

                <ReviewCard title="Business" onEdit={() => goTo(2)}>
                  <ReviewRow label="Business type" value={form.businessType} />
                  <ReviewRow label="Legal name" value={form.legalName} />
                  <ReviewRow label="Registration no." value={form.registrationNumber} />
                  <ReviewRow label="PAN" value={form.panNumber} />
                  <ReviewRow label="VAT registered" value={form.vatRegistered ? 'Yes' : 'No'} />
                  <ReviewRow label="Alternate phone" value={form.alternatePhone} />
                </ReviewCard>

                <ReviewCard title="Addresses" onEdit={() => goTo(3)}>
                  <ReviewRow
                    label="Business"
                    value={[addressLine(form, 'business'), form.postalCode]
                      .filter(Boolean)
                      .join(' · ')}
                  />
                  <ReviewRow label="Pickup" value={addressLine(form, 'pickup')} />
                  <ReviewRow label="Return" value={addressLine(form, 'return')} />
                </ReviewCard>

                <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
                  <BadgeCheck className="mt-0.5 size-5 shrink-0 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Your vendor account will be created with a
                    <span className="font-medium text-foreground"> pending</span> status. An
                    administrator must approve your application before your vendor account becomes
                    active.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
            <Button
              key="back"
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={step === 0 || isSubmitting}
              className={step === 0 ? 'invisible' : ''}
            >
              <ArrowLeft className="size-4" /> Back
            </Button>

            {step < LAST_STEP ? (
              <Button key="next" type="button" onClick={handleNext} className="min-w-36">
                Continue <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button key="submit" type="submit" disabled={isSubmitting} className="min-w-48">
                {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isSubmitting ? 'Submitting...' : 'Submit Vendor Registration'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
 * SMALL PIECES
 * --------------------------------------------------------------------- */
function addressLine(form: Form, kind: AddressKind) {
  const keys = ADDRESS_KEYS[kind];
  return [keys.street, keys.city, keys.district, keys.province]
    .map((key) => str(form, key).trim())
    .filter(Boolean)
    .join(', ');
}

function SuccessPanel({ storeName }: { storeName: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 text-center shadow-lg sm:p-10">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-success/10 blur-3xl" />
      </div>
      <div className="relative">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
          <BadgeCheck className="size-9" />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-foreground sm:text-3xl">
          Application submitted
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
          <span className="font-semibold text-foreground">{storeName}</span> is waiting for admin
          approval. We will review your details shortly.
        </p>

        <ol className="mx-auto mt-8 grid max-w-xl gap-3 text-left sm:grid-cols-3">
          {[
            ['1', 'Submitted', 'Your application is in the queue.'],
            ['2', 'Admin review', 'We verify your business details.'],
            ['3', 'Start selling', 'Log in and list your first product.'],
          ].map(([number, title, text], index) => (
            <li
              key={number}
              className={`rounded-2xl border p-4 ${
                index === 0 ? 'border-success/40 bg-success/10' : 'border-border bg-background'
              }`}
            >
              <span
                className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                  index === 0 ? 'bg-success text-success-foreground' : 'bg-secondary text-foreground'
                }`}
              >
                {index === 0 ? <Check className="size-4" /> : number}
              </span>
              <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/seller/login"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Go to seller login
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-6 text-sm font-semibold text-foreground transition hover:bg-secondary"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

function MiniAction({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary hover:bg-primary/5 hover:text-primary"
    >
      {children}
    </button>
  );
}

function AddressBlock({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description: string;
  actions: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-background p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">{actions}</div>
      </div>
      {children}
    </section>
  );
}

function ReviewCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-4 py-2.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <Pencil className="size-3.5" /> Edit
        </button>
      </div>
      <dl className="divide-y divide-border">{children}</dl>
    </section>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 px-4 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-xs font-medium text-muted-foreground sm:pt-0.5">{label}</dt>
      <dd className="min-w-0 break-words text-sm text-foreground">{value || '—'}</dd>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  list?: string;
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  hint,
  autoComplete,
  inputMode,
  list,
}: FieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>

      <div className="relative">
        <Input
          id={id}
          type={isPassword && visible ? 'text' : type}
          value={value}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          inputMode={inputMode}
          list={list}
          onChange={(event) => onChange(event.target.value)}
          className={`h-11 ${isPassword ? 'pr-11' : ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition hover:text-foreground"
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>

      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function AddressFields({
  kind,
  form,
  onChange,
  includePostalCode = false,
}: {
  kind: AddressKind;
  form: Form;
  onChange: (field: keyof VendorRegistrationData, value: string | boolean) => void;
  includePostalCode?: boolean;
}) {
  const keys = ADDRESS_KEYS[kind];
  const province = str(form, keys.province);
  const district = str(form, keys.district);
  const city = str(form, keys.city);

  const districts = getDistricts(province);
  const cities = getCities(province, district);

  // Bumped after a selection so the next dropdown opens by itself (quick flow).
  const [signals, setSignals] = useState({ district: 0, city: 0 });

  function selectProvince(value: string) {
    if (value === province) return;
    onChange(keys.province, value);
    onChange(keys.district, '');
    onChange(keys.city, '');
    setSignals((current) => ({ ...current, district: current.district + 1 }));
  }

  function selectDistrict(value: string) {
    if (value === district) return;
    onChange(keys.district, value);
    onChange(keys.city, '');
    setSignals((current) => ({ ...current, city: current.city + 1 }));
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <AddressSelect
        label="Province"
        value={province}
        options={getProvinces()}
        placeholder="Select province"
        onChange={selectProvince}
        required
      />

      <AddressSelect
        label="District"
        value={district}
        options={districts}
        placeholder="Select district"
        disabled={!province}
        disabledText="Select a province first"
        openSignal={signals.district}
        onChange={selectDistrict}
        required
      />

      {cities.length > 0 || !district ? (
        <AddressSelect
          label="City / Municipality"
          value={city}
          options={cities}
          placeholder="Select city or municipality"
          disabled={!district}
          disabledText="Select a district first"
          openSignal={signals.city}
          allowCustom
          hint={district ? 'Not in the list? Type its name and choose "Use ...".' : undefined}
          onChange={(value) => onChange(keys.city, value)}
          required
        />
      ) : (
        <Field
          label="City / Municipality"
          value={city}
          placeholder="Type your city or municipality"
          onChange={(value) => onChange(keys.city, value)}
          required
        />
      )}

      <Field
        label="Street"
        value={str(form, keys.street)}
        placeholder="Tole, street, house no."
        autoComplete="street-address"
        onChange={(value) => onChange(keys.street, value)}
        required
      />

      {includePostalCode && (
        <Field
          label="Postal Code"
          value={form.postalCode ?? ''}
          inputMode="numeric"
          onChange={(value) => onChange('postalCode', value)}
        />
      )}
    </div>
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
          onClick={() => (open ? closePanel() : openPanel())}
          className={`flex h-11 w-full items-center justify-between gap-2 rounded-md border bg-background px-3 text-left text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-70 ${
            open ? 'border-ring ring-3 ring-ring/30' : 'border-input'
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

      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
