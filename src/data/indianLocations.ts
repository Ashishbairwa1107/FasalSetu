import { Language } from '../types';

export interface DistrictItem {
  id: string;
  nameHi: string;
  nameEn: string;
}

export interface StateItem {
  id: string;
  nameHi: string;
  nameEn: string;
  districts: DistrictItem[];
}

export const INDIAN_STATES: StateItem[] = [
  {
    id: 'chhattisgarh',
    nameHi: 'छत्तीसगढ़',
    nameEn: 'Chhattisgarh',
    districts: [
      { id: 'raipur', nameHi: 'रायपुर', nameEn: 'Raipur' },
      { id: 'durg', nameHi: 'दुर्ग', nameEn: 'Durg' },
      { id: 'bilaspur', nameHi: 'बिलासपुर', nameEn: 'Bilaspur' },
      { id: 'rajnandgaon', nameHi: 'राजनांदगांव', nameEn: 'Rajnandgaon' },
      { id: 'korba', nameHi: 'कोरबा', nameEn: 'Korba' },
      { id: 'raigarh', nameHi: 'रायगढ़', nameEn: 'Raigarh' },
      { id: 'dhamtari', nameHi: 'धमतरी', nameEn: 'Dhamtari' },
      { id: 'mahasamund', nameHi: 'महासमुंद', nameEn: 'Mahasamund' },
      { id: 'janjgir_champa', nameHi: 'जांजगीर-चांपा', nameEn: 'Janjgir-Champa' },
      { id: 'bastar', nameHi: 'बस्तर (जगदलपुर)', nameEn: 'Bastar (Jagdalpur)' },
      { id: 'balod', nameHi: 'बालोद', nameEn: 'Balod' },
      { id: 'bemetara', nameHi: 'बेमेतरा', nameEn: 'Bemetara' },
      { id: 'balodabazar', nameHi: 'बलौदाबाजार-भाटापारा', nameEn: 'Balodabazar' },
      { id: 'gariaband', nameHi: 'गरियाबंद', nameEn: 'Gariaband' },
      { id: 'mungeli', nameHi: 'मुंगेली', nameEn: 'Mungeli' },
      { id: 'kawardha', nameHi: 'कबीरधाम (कवर्धा)', nameEn: 'Kabirdham (Kawardha)' },
      { id: 'surguja', nameHi: 'सरगुजा (अंबिकापुर)', nameEn: 'Surguja (Ambikapur)' },
      { id: 'kanker', nameHi: 'उत्तर बस्तर कांकेर', nameEn: 'Kanker' },
      { id: 'kondagaon', nameHi: 'कोंडागांव', nameEn: 'Kondagaon' },
      { id: 'sukma', nameHi: 'सुकमा', nameEn: 'Sukma' },
      { id: 'dantewada', nameHi: 'दंतेवाड़ा', nameEn: 'Dantewada' },
      { id: 'bijapur', nameHi: 'बीजापुर', nameEn: 'Bijapur' },
      { id: 'narayanpur', nameHi: 'नारायणपुर', nameEn: 'Narayanpur' },
      { id: 'surajpur', nameHi: 'सूरजपुर', nameEn: 'Surajpur' },
      { id: 'balrampur', nameHi: 'बलरामपुर', nameEn: 'Balrampur' },
      { id: 'korea', nameHi: 'कोरिया', nameEn: 'Korea' },
      { id: 'jashpur', nameHi: 'जशपुर', nameEn: 'Jashpur' },
      { id: 'gpm', nameHi: 'गौरेला-पेंड्रा-मरवाही', nameEn: 'Gaurela-Pendra-Marwahi' },
      { id: 'khairagarh', nameHi: 'खैरागढ़-छुईखदान-गंडई', nameEn: 'Khairagarh' },
      { id: 'manendragarh', nameHi: 'मनेंद्रगढ़-चिरमिरी-भरतपुर', nameEn: 'Manendragarh' },
      { id: 'mohla_manpur', nameHi: 'मोहला-मानपुर-अंबागढ़ चौकी', nameEn: 'Mohla-Manpur' },
      { id: 'sarangarh', nameHi: 'सारंगढ़-बिलाईगढ़', nameEn: 'Sarangarh-Bilaigarh' },
      { id: 'sakti', nameHi: 'सक्ती', nameEn: 'Sakti' }
    ]
  },
  {
    id: 'madhya_pradesh',
    nameHi: 'मध्य प्रदेश',
    nameEn: 'Madhya Pradesh',
    districts: [
      { id: 'indore', nameHi: 'इंदौर', nameEn: 'Indore' },
      { id: 'bhopal', nameHi: 'भोपाल', nameEn: 'Bhopal' },
      { id: 'ujjain', nameHi: 'उज्जैन', nameEn: 'Ujjain' },
      { id: 'jabalpur', nameHi: 'जबलपुर', nameEn: 'Jabalpur' },
      { id: 'gwalior', nameHi: 'ग्वालियर', nameEn: 'Gwalior' },
      { id: 'sagar', nameHi: 'सागर', nameEn: 'Sagar' },
      { id: 'dewas', nameHi: 'देवास', nameEn: 'Dewas' },
      { id: 'satna', nameHi: 'सतना', nameEn: 'Satna' },
      { id: 'ratlam', nameHi: 'रतलाम', nameEn: 'Ratlam' },
      { id: 'rewa', nameHi: 'रीवा', nameEn: 'Rewa' },
      { id: 'hoshangabad', nameHi: 'नर्मदापुरम (होशंगाबाद)', nameEn: 'Narmadapuram' },
      { id: 'chhindwara', nameHi: 'छिंदवाड़ा', nameEn: 'Chhindwara' },
      { id: 'sehore', nameHi: 'सीहोर', nameEn: 'Sehore' },
      { id: 'khargone', nameHi: 'खरगोन', nameEn: 'Khargone' },
      { id: 'khandwa', nameHi: 'खंडवा', nameEn: 'Khandwa' },
      { id: 'mandsaur', nameHi: 'मंदसौर', nameEn: 'Mandsaur' },
      { id: 'vidisha', nameHi: 'विदिशा', nameEn: 'Vidisha' },
      { id: 'dhar', nameHi: 'धार', nameEn: 'Dhar' }
    ]
  },
  {
    id: 'maharashtra',
    nameHi: 'महाराष्ट्र',
    nameEn: 'Maharashtra',
    districts: [
      { id: 'pune', nameHi: 'पुणे', nameEn: 'Pune' },
      { id: 'nagpur', nameHi: 'नागपुर', nameEn: 'Nagpur' },
      { id: 'nashik', nameHi: 'नासिक', nameEn: 'Nashik' },
      { id: 'chhatrapati_sambhajinagar', nameHi: 'छत्रपति संभाजीनगर (औरंगाबाद)', nameEn: 'Chhatrapati Sambhajinagar' },
      { id: 'solapur', nameHi: 'सोलापुर', nameEn: 'Solapur' },
      { id: 'amravati', nameHi: 'अमरावती', nameEn: 'Amravati' },
      { id: 'kolhapur', nameHi: 'कोल्हापुर', nameEn: 'Kolhapur' },
      { id: 'sangli', nameHi: 'सांगली', nameEn: 'Sangli' },
      { id: 'satara', nameHi: 'सतारा', nameEn: 'Satara' },
      { id: 'latur', nameHi: 'लातूर', nameEn: 'Latur' },
      { id: 'jalgaon', nameHi: 'जलगांव', nameEn: 'Jalgaon' },
      { id: 'akola', nameHi: 'अकोला', nameEn: 'Akola' },
      { id: 'yavatmal', nameHi: 'यवतमाल', nameEn: 'Yavatmal' },
      { id: 'nanded', nameHi: 'नांदेड़', nameEn: 'Nanded' },
      { id: 'ahmednagar', nameHi: 'अहिल्यानगर (अहमदनगर)', nameEn: 'Ahilyanagar' }
    ]
  },
  {
    id: 'uttar_pradesh',
    nameHi: 'उत्तर प्रदेश',
    nameEn: 'Uttar Pradesh',
    districts: [
      { id: 'lucknow', nameHi: 'लखनऊ', nameEn: 'Lucknow' },
      { id: 'kanpur', nameHi: 'कानपुर नगर', nameEn: 'Kanpur' },
      { id: 'varanasi', nameHi: 'वाराणसी', nameEn: 'Varanasi' },
      { id: 'prayagraj', nameHi: 'प्रयागराज (इलाहाबाद)', nameEn: 'Prayagraj' },
      { id: 'gorakhpur', nameHi: 'गोरखपुर', nameEn: 'Gorakhpur' },
      { id: 'agra', nameHi: 'आगरा', nameEn: 'Agra' },
      { id: 'meerut', nameHi: 'मेरठ', nameEn: 'Meerut' },
      { id: 'bareilly', nameHi: 'बरेली', nameEn: 'Bareilly' },
      { id: 'aligarh', nameHi: 'अलीगढ़', nameEn: 'Aligarh' },
      { id: 'moradabad', nameHi: 'मुरादाबाद', nameEn: 'Moradabad' },
      { id: 'ayodhya', nameHi: 'अयोध्या (फैजाबाद)', nameEn: 'Ayodhya' },
      { id: 'jhansi', nameHi: 'झांसी', nameEn: 'Jhansi' },
      { id: 'mathura', nameHi: 'मथुरा', nameEn: 'Mathura' },
      { id: 'basti', nameHi: 'बस्ती', nameEn: 'Basti' },
      { id: 'azamgarh', nameHi: 'आजमगढ़', nameEn: 'Azamgarh' }
    ]
  },
  {
    id: 'punjab',
    nameHi: 'पंजाब',
    nameEn: 'Punjab',
    districts: [
      { id: 'ludhiana', nameHi: 'लुधियाना', nameEn: 'Ludhiana' },
      { id: 'amritsar', nameHi: 'अमृतसर', nameEn: 'Amritsar' },
      { id: 'jalandhar', nameHi: 'जालंधर', nameEn: 'Jalandhar' },
      { id: 'patiala', nameHi: 'पटियाला', nameEn: 'Patiala' },
      { id: 'bathinda', nameHi: 'बठिंडा', nameEn: 'Bathinda' },
      { id: 'hoshiarpur', nameHi: 'होशियारपुर', nameEn: 'Hoshiarpur' },
      { id: 'moga', nameHi: 'मोगा', nameEn: 'Moga' },
      { id: 'sangrur', nameHi: 'संगरूर', nameEn: 'Sangrur' },
      { id: 'firozpur', nameHi: 'फिरोजपुर', nameEn: 'Firozpur' },
      { id: 'gurdaspur', nameHi: 'गुरदासपुर', nameEn: 'Gurdaspur' }
    ]
  },
  {
    id: 'haryana',
    nameHi: 'हरियाणा',
    nameEn: 'Haryana',
    districts: [
      { id: 'karnal', nameHi: 'करनाल', nameEn: 'Karnal' },
      { id: 'hisar', nameHi: 'हिसार', nameEn: 'Hisar' },
      { id: 'rohtak', nameHi: 'रोहतक', nameEn: 'Rohtak' },
      { id: 'ambala', nameHi: 'अंबाला', nameEn: 'Ambala' },
      { id: 'kurukshetra', nameHi: 'कुरुक्षेत्र', nameEn: 'Kurukshetra' },
      { id: 'panipat', nameHi: 'पानीपत', nameEn: 'Panipat' },
      { id: 'sonipat', nameHi: 'सोनीपत', nameEn: 'Sonipat' },
      { id: 'sirsa', nameHi: 'सिरसा', nameEn: 'Sirsa' },
      { id: 'fatehabad', nameHi: 'फतेहाबाद', nameEn: 'Fatehabad' },
      { id: 'bhiwani', nameHi: 'भिवानी', nameEn: 'Bhiwani' },
      { id: 'yamunanagar', nameHi: 'यमुनानगर', nameEn: 'Yamunanagar' }
    ]
  },
  {
    id: 'rajasthan',
    nameHi: 'राजस्थान',
    nameEn: 'Rajasthan',
    districts: [
      { id: 'jaipur', nameHi: 'जयपुर', nameEn: 'Jaipur' },
      { id: 'jodhpur', nameHi: 'जोधपुर', nameEn: 'Jodhpur' },
      { id: 'kota', nameHi: 'कोटा', nameEn: 'Kota' },
      { id: 'bikaner', nameHi: 'बीकानेर', nameEn: 'Bikaner' },
      { id: 'ajmer', nameHi: 'अजमेर', nameEn: 'Ajmer' },
      { id: 'udaipur', nameHi: 'उदयपुर', nameEn: 'Udaipur' },
      { id: 'bharatpur', nameHi: 'भरतपुर', nameEn: 'Bharatpur' },
      { id: 'alwar', nameHi: 'अलवर', nameEn: 'Alwar' },
      { id: 'sriganganagar', nameHi: 'श्रीगंगानगर', nameEn: 'Sri Ganganagar' },
      { id: 'hanumangarh', nameHi: 'हनुमानगढ़', nameEn: 'Hanumangarh' },
      { id: 'sikar', nameHi: 'सीकर', nameEn: 'Sikar' },
      { id: 'nagaur', nameHi: 'नागौर', nameEn: 'Nagaur' }
    ]
  },
  {
    id: 'bihar',
    nameHi: 'बिहार',
    nameEn: 'Bihar',
    districts: [
      { id: 'patna', nameHi: 'पटना', nameEn: 'Patna' },
      { id: 'gaya', nameHi: 'गया', nameEn: 'Gaya' },
      { id: 'muzaffarpur', nameHi: 'मुजफ्फरपुर', nameEn: 'Muzaffarpur' },
      { id: 'bhagalpur', nameHi: 'भागलपुर', nameEn: 'Bhagalpur' },
      { id: 'purnia', nameHi: 'पूर्णिया', nameEn: 'Purnia' },
      { id: 'darbhanga', nameHi: 'दरभंगा', nameEn: 'Darbhanga' },
      { id: 'samastipur', nameHi: 'समस्तीपुर', nameEn: 'Samastipur' },
      { id: 'rohtas', nameHi: 'रोहतास (सासाराम)', nameEn: 'Rohtas' },
      { id: 'nalanda', nameHi: 'नालंदा (बिहारशरीफ)', nameEn: 'Nalanda' },
      { id: 'motihari', nameHi: 'पूर्वी चंपारण (मोतिहारी)', nameEn: 'East Champaran' }
    ]
  },
  {
    id: 'gujarat',
    nameHi: 'गुजरात',
    nameEn: 'Gujarat',
    districts: [
      { id: 'ahmedabad', nameHi: 'अहमदाबाद', nameEn: 'Ahmedabad' },
      { id: 'surat', nameHi: 'सूरत', nameEn: 'Surat' },
      { id: 'vadodara', nameHi: 'वडोदरा', nameEn: 'Vadodara' },
      { id: 'rajkot', nameHi: 'राजकोट', nameEn: 'Rajkot' },
      { id: 'bhavnagar', nameHi: 'भावनगर', nameEn: 'Bhavnagar' },
      { id: 'junagadh', nameHi: 'जूनागढ़', nameEn: 'Junagadh' },
      { id: 'anand', nameHi: 'आनंद', nameEn: 'Anand' },
      { id: 'mehsana', nameHi: 'मेहसाणा', nameEn: 'Mehsana' },
      { id: 'banaskantha', nameHi: 'बनासकांठा (पालनपुर)', nameEn: 'Banaskantha' },
      { id: 'kutch', nameHi: 'कच्छ (भुज)', nameEn: 'Kutch' }
    ]
  },
  {
    id: 'odisha',
    nameHi: 'ओडिशा',
    nameEn: 'Odisha',
    districts: [
      { id: 'bhubaneswar', nameHi: 'खुर्दा (भुवनेश्वर)', nameEn: 'Khurda (Bhubaneswar)' },
      { id: 'cuttack', nameHi: 'कटक', nameEn: 'Cuttack' },
      { id: 'sambalpur', nameHi: 'संबलपुर', nameEn: 'Sambalpur' },
      { id: 'balasore', nameHi: 'बालेश्वर', nameEn: 'Balasore' },
      { id: 'bhadrak', nameHi: 'भद्रक', nameEn: 'Bhadrak' },
      { id: 'puri', nameHi: 'पुरी', nameEn: 'Puri' },
      { id: 'ganjam', nameHi: 'गंजम (ब्रह्मपुर)', nameEn: 'Ganjam' },
      { id: 'bargarh', nameHi: 'बरगढ़', nameEn: 'Bargarh' },
      { id: 'kalahandi', nameHi: 'कालाहांडी', nameEn: 'Kalahandi' },
      { id: 'mayurbhanj', nameHi: 'मयूरभंज (बारीपदा)', nameEn: 'Mayurbhanj' }
    ]
  },
  {
    id: 'west_bengal',
    nameHi: 'पश्चिम बंगाल',
    nameEn: 'West Bengal',
    districts: [
      { id: 'kolkata', nameHi: 'कोलकाता', nameEn: 'Kolkata' },
      { id: 'burdwan', nameHi: 'पूर्व बर्धमान', nameEn: 'Purba Bardhaman' },
      { id: 'hooghly', nameHi: 'हुगली', nameEn: 'Hooghly' },
      { id: 'nadia', nameHi: 'नादिया (कृष्णानगर)', nameEn: 'Nadia' },
      { id: 'murshidabad', nameHi: 'मुर्शिदाबाद (बहरामपुर)', nameEn: 'Murshidabad' },
      { id: 'north_24_parganas', nameHi: 'उत्तर 24 परगना', nameEn: 'North 24 Parganas' },
      { id: 'south_24_parganas', nameHi: 'दक्षिण 24 परगना', nameEn: 'South 24 Parganas' },
      { id: 'medinipur', nameHi: 'पश्चिम मेदिनीपुर', nameEn: 'Paschim Medinipur' },
      { id: 'malda', nameHi: 'मालदा', nameEn: 'Malda' },
      { id: 'jalpaiguri', nameHi: 'जलपाईगुड़ी', nameEn: 'Jalpaiguri' }
    ]
  },
  {
    id: 'tamil_nadu',
    nameHi: 'तमिलनाडु',
    nameEn: 'Tamil Nadu',
    districts: [
      { id: 'chennai', nameHi: 'चेन्नई', nameEn: 'Chennai' },
      { id: 'coimbatore', nameHi: 'कोयंबटूर', nameEn: 'Coimbatore' },
      { id: 'madurai', nameHi: 'मदुरै', nameEn: 'Madurai' },
      { id: 'tiruchirappalli', nameHi: 'तिरुचिरापल्ली (त्रिची)', nameEn: 'Tiruchirappalli' },
      { id: 'salem', nameHi: 'सेलम', nameEn: 'Salem' },
      { id: 'thanjavur', nameHi: 'तंजावुर', nameEn: 'Thanjavur' },
      { id: 'tirunelveli', nameHi: 'तिरुनेलवेली', nameEn: 'Tirunelveli' },
      { id: 'erode', nameHi: 'इरोड', nameEn: 'Erode' },
      { id: 'vellore', nameHi: 'वेल्लोर', nameEn: 'Vellore' },
      { id: 'dindigul', nameHi: 'डिंडीगुल', nameEn: 'Dindigul' }
    ]
  },
  {
    id: 'andhra_pradesh',
    nameHi: 'आंध्र प्रदेश',
    nameEn: 'Andhra Pradesh',
    districts: [
      { id: 'visakhapatnam', nameHi: 'विशाखापट्टनम', nameEn: 'Visakhapatnam' },
      { id: 'vijayawada', nameHi: 'कृष्णा (विजयवाड़ा)', nameEn: 'Krishna (Vijayawada)' },
      { id: 'guntur', nameHi: 'गुंटूर', nameEn: 'Guntur' },
      { id: 'kurnool', nameHi: 'कुरनूल', nameEn: 'Kurnool' },
      { id: 'nellore', nameHi: 'नेल्लोर', nameEn: 'Nellore' },
      { id: 'rajahmundry', nameHi: 'पूर्वी गोदावरी (राजमुंदरी)', nameEn: 'East Godavari' },
      { id: 'anantapur', nameHi: 'अनंतपुर', nameEn: 'Anantapur' },
      { id: 'tirupati', nameHi: 'तिरुपति (चित्तूर)', nameEn: 'Tirupati (Chittoor)' }
    ]
  },
  {
    id: 'telangana',
    nameHi: 'तेलंगाना',
    nameEn: 'Telangana',
    districts: [
      { id: 'hyderabad', nameHi: 'हैदराबाद', nameEn: 'Hyderabad' },
      { id: 'warangal', nameHi: 'वारंगल', nameEn: 'Warangal' },
      { id: 'karimnagar', nameHi: 'करीमनगर', nameEn: 'Karimnagar' },
      { id: 'khammam', nameHi: 'खम्मम', nameEn: 'Khammam' },
      { id: 'nizamabad', nameHi: 'निजामाबाद', nameEn: 'Nizamabad' },
      { id: 'nalgonda', nameHi: 'नलगोंडा', nameEn: 'Nalgonda' },
      { id: 'mahabubnagar', nameHi: 'महबूबनगर', nameEn: 'Mahabubnagar' },
      { id: 'medak', nameHi: 'मेदक', nameEn: 'Medak' }
    ]
  },
  {
    id: 'karnataka',
    nameHi: 'कर्नाटक',
    nameEn: 'Karnataka',
    districts: [
      { id: 'bengaluru', nameHi: 'बेंगलुरु', nameEn: 'Bengaluru' },
      { id: 'mysuru', nameHi: 'मैसूरु', nameEn: 'Mysuru' },
      { id: 'hubballi_dharwad', nameHi: 'धारवाड़ (हुबली)', nameEn: 'Dharwad (Hubballi)' },
      { id: 'belagavi', nameHi: 'बेलगावी (बेलगाम)', nameEn: 'Belagavi' },
      { id: 'kalaburagi', nameHi: 'कलबुर्गी (गुलबर्गा)', nameEn: 'Kalaburagi' },
      { id: 'shivamogga', nameHi: 'शिवमोग्गा (शिमोगा)', nameEn: 'Shivamogga' },
      { id: 'ballari', nameHi: 'बल्लारी', nameEn: 'Ballari' },
      { id: 'vijayapura', nameHi: 'विजयपुरा (बीजापुर)', nameEn: 'Vijayapura' }
    ]
  },
  {
    id: 'kerala',
    nameHi: 'केरल',
    nameEn: 'Kerala',
    districts: [
      { id: 'thiruvananthapuram', nameHi: 'तिरुवनंतपुरम', nameEn: 'Thiruvananthapuram' },
      { id: 'kochi', nameHi: 'एर्नाकुलम (कोच्चि)', nameEn: 'Ernakulam (Kochi)' },
      { id: 'kozhikode', nameHi: 'कोझिकोड (कालिकट)', nameEn: 'Kozhikode' },
      { id: 'palakkad', nameHi: 'पालक्काड़', nameEn: 'Palakkad' },
      { id: 'thrissur', nameHi: 'त्रिशूर', nameEn: 'Thrissur' },
      { id: 'kollam', nameHi: 'कोल्लम', nameEn: 'Kollam' },
      { id: 'kottayam', nameHi: 'कोट्टायम', nameEn: 'Kottayam' },
      { id: 'alappuzha', nameHi: 'अलप्पुझा (अलेप्पी)', nameEn: 'Alappuzha' }
    ]
  },
  {
    id: 'assam',
    nameHi: 'असम',
    nameEn: 'Assam',
    districts: [
      { id: 'guwahati', nameHi: 'कामरूप (गुवाहाटी)', nameEn: 'Kamrup (Guwahati)' },
      { id: 'dibrugarh', nameHi: 'डिब्रूगढ़', nameEn: 'Dibrugarh' },
      { id: 'silchar', nameHi: 'कछार (सिलचर)', nameEn: 'Cachar (Silchar)' },
      { id: 'jorhat', nameHi: 'जोरहाट', nameEn: 'Jorhat' },
      { id: 'nagaon', nameHi: 'नगांव', nameEn: 'Nagaon' },
      { id: 'tezpur', nameHi: 'सोनितपुर (तेजपुर)', nameEn: 'Sonitpur (Tezpur)' }
    ]
  },
  {
    id: 'jharkhand',
    nameHi: 'झारखंड',
    nameEn: 'Jharkhand',
    districts: [
      { id: 'ranchi', nameHi: 'रांची', nameEn: 'Ranchi' },
      { id: 'jamshedpur', nameHi: 'पूर्वी सिंहभूम (जमशेदपुर)', nameEn: 'East Singhbhum' },
      { id: 'dhanbad', nameHi: 'धनबाद', nameEn: 'Dhanbad' },
      { id: 'bokaro', nameHi: 'बोकारो', nameEn: 'Bokaro' },
      { id: 'deoghar', nameHi: 'देवघर', nameEn: 'Deoghar' },
      { id: 'hazaribagh', nameHi: 'हजारीबाग', nameEn: 'Hazaribagh' }
    ]
  },
  {
    id: 'uttarakhand',
    nameHi: 'उत्तराखंड',
    nameEn: 'Uttarakhand',
    districts: [
      { id: 'dehradun', nameHi: 'देहरादून', nameEn: 'Dehradun' },
      { id: 'haridwar', nameHi: 'हरिद्वार', nameEn: 'Haridwar' },
      { id: 'us_nagar', nameHi: 'ऊधम सिंह नगर (रुद्रपुर)', nameEn: 'Udham Singh Nagar' },
      { id: 'nainital', nameHi: 'नैनीताल (हल्द्वानी)', nameEn: 'Nainital' },
      { id: 'almora', nameHi: 'अल्मोड़ा', nameEn: 'Almora' }
    ]
  },
  {
    id: 'himachal_pradesh',
    nameHi: 'हिमाचल प्रदेश',
    nameEn: 'Himachal Pradesh',
    districts: [
      { id: 'shimla', nameHi: 'शिमला', nameEn: 'Shimla' },
      { id: 'kangra', nameHi: 'कांगड़ा (धर्मशाला)', nameEn: 'Kangra' },
      { id: 'mandi_hp', nameHi: 'मंडी', nameEn: 'Mandi' },
      { id: 'solan', nameHi: 'सोलन', nameEn: 'Solan' },
      { id: 'kullu', nameHi: 'कुल्लू', nameEn: 'Kullu' }
    ]
  },
  {
    id: 'delhi',
    nameHi: 'दिल्ली (NCT)',
    nameEn: 'Delhi (NCT)',
    districts: [
      { id: 'north_delhi', nameHi: 'उत्तर दिल्ली (नरेला)', nameEn: 'North Delhi' },
      { id: 'north_west_delhi', nameHi: 'उत्तर पश्चिम दिल्ली (कंझावला)', nameEn: 'North West Delhi' },
      { id: 'south_west_delhi', nameHi: 'दक्षिण पश्चिम दिल्ली (नजफगढ़)', nameEn: 'South West Delhi' },
      { id: 'east_delhi', nameHi: 'पूर्वी दिल्ली', nameEn: 'East Delhi' }
    ]
  },
  {
    id: 'jammu_and_kashmir',
    nameHi: 'जम्मू और कश्मीर',
    nameEn: 'Jammu & Kashmir',
    districts: [
      { id: 'jammu', nameHi: 'जम्मू', nameEn: 'Jammu' },
      { id: 'srinagar', nameHi: 'श्रीनगर', nameEn: 'Srinagar' },
      { id: 'anantnag', nameHi: 'अनंतनाग', nameEn: 'Anantnag' },
      { id: 'baramulla', nameHi: 'बारामूला', nameEn: 'Baramulla' },
      { id: 'kathua', nameHi: 'कठुआ', nameEn: 'Kathua' }
    ]
  }
];

/**
 * Helper to find state by name (loose match for Hindi or English strings)
 */
export const findStateByName = (stateName: string): StateItem | undefined => {
  if (!stateName) return undefined;
  const clean = stateName.toLowerCase().trim();
  return INDIAN_STATES.find(s => 
    s.nameHi.toLowerCase().includes(clean) ||
    s.nameEn.toLowerCase().includes(clean) ||
    clean.includes(s.nameHi.toLowerCase()) ||
    clean.includes(s.nameEn.toLowerCase())
  );
};

/**
 * Format state string in the selected single language (e.g. "छत्तीसगढ़" or "Chhattisgarh")
 */
export const formatStateLabel = (state: StateItem, lang: Language = 'hi'): string => {
  return lang === 'en' ? state.nameEn : state.nameHi;
};

/**
 * Format district string in the selected single language (e.g. "रायपुर" or "Raipur")
 */
export const formatDistrictLabel = (dist: DistrictItem, lang: Language = 'hi'): string => {
  return lang === 'en' ? dist.nameEn : dist.nameHi;
};

/**
 * Cleans any legacy bilingual parentheses string into the selected single language.
 * e.g. "रायपुर (Raipur)" -> "रायपुर" (in Hindi) or "Raipur" (in English)
 */
export const cleanLocationLabel = (text: string, lang: Language = 'hi'): string => {
  if (!text) return '';
  const match = text.match(/^([^(]+)\s*\(([^)]+)\)$/);
  if (match) {
    return lang === 'en' ? match[2].trim() : match[1].trim();
  }
  return text.trim();
};
