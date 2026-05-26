'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguajeContext';
import { useState } from 'react';

export default function SergioLandscapeHome() {
  
  const { lang } = useLanguage();
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const content = {
    en: {
      heroTitle: "Creating Stunning Outdoor Spaces",
      heroSub: "Expert landscape design to elevate your property's beauty",
      freeEst: "SCHEDULE A CONSULTATION",
      aboutTitle:"About Sergio Landscape Design",
      ourVisionTitle:"Our vision",
      ourVision:"At Sergio Landscape Design, we believe that a well-designed outdoor space can transform lives. Our vision is to create beautiful, functional landscapes that enhance the natural beauty of your home or business.",
      ourMissionTitle:"Our mission",
      ourMission:"At Sergio Landscape Design, our mission is to provide the highest quality landscape design services to our clients. We strive to create beautiful outdoor spaces that enhance the natural beauty of the environment while meeting the unique needs of each client.",
      ourServicesTitle:"Our Services",
      ourServices:"We offer a wide range of landscape design services, including garden design, landscape lighting, and more. Whether you're looking to create a lush garden oasis or a functional outdoor space for entertaining, we have the solutions you need.",
      ourExperienceTitle:"Our Experience ",
      ourExperience:"With over 15 years of experience, our team of skilled professionals has the expertise and knowledge to bring your vision to life. We use the latest techniques and materials to create stunning landscape designs that are both beautiful and functional.",
      imagesTitle:"Capturing the beauty of nature",
      imgDesc:"Stay tuned!",
      whyUs: "Why Choose Sergio Landscape?",
      whyPoints: ["Licensed & Insured", "Local Business", "Attention to Detail", "Quality Materials"],
      premiumQ:'Premium Quality'
    },
    es: {
      heroTitle: "Creando espacios exteriores impresionantes",
      heroSub: "Diseño paisajístico experto para realzar la belleza de su propiedad.",
      freeEst: "Agende una consulta",
      aboutTitle:"Acerca de Sergio Landscape Design",
      ourVisionTitle:"Nuestra Vision",
      ourVision:"En Sergio Landscape Design, creemos que un espacio exterior bien diseñado puede transformar vidas. Nuestra visión es crear paisajes hermosos y funcionales que realcen la belleza natural de su hogar o negocio.",
      ourMissionTitle:"Mision",
      ourMission:"En Sergio Landscape Design, nuestra misión es brindar servicios de diseño paisajístico de la más alta calidad a nuestros clientes.Nos esforzamos por crear hermosos espacios al aire libre que realcen la belleza natural del entorno, al tiempo que satisfacen las necesidades únicas de cada cliente.",
      ourServicesTitle:"Nuestros Servicios",
      ourServices:"Ofrecemos una amplia gama de servicios de diseño paisajístico, que incluyen diseño de jardines, iluminación de exteriores y más. Ya sea que busque crear un exuberante oasis ajardinado o un espacio al aire libre funcional para recibir invitados, tenemos las soluciones que usted necesita.",
      ourExperienceTitle:"Nuestra Experiencia"  ,
      ourExperience:"Con más de 15 años de experiencia, nuestro equipo de profesionales cualificados cuenta con la pericia y el conocimiento necesarios para hacer realidad su visión. Utilizamos las técnicas y los materiales más innovadores para crear impresionantes diseños paisajísticos que son, a la vez, bellos y funcionales.",
      imagesTitle:"Capturando la belleza de la naturaleza",
      imgDesc:"Mantenganse al tanto!",
      whyUs: "¿Por qué elegir Sergio Landscape?",
      whyPoints: ["Licenciados y Asegurados", "Negocio Local", "Atención al Detalle", "Materiales de Calidad"],
      premiumQ:'Calidad Premium'
    }
  };

  const t = content[lang as 'en' | 'es'];

  return (
    <div className="font-sans text-gray-900 bg-stone-50">
      
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 ">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold mb-4">
              {t.premiumQ}
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
              {t.heroTitle}
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              {t.heroSub}
            </p>
            <Link href="/schedule"> 
              <button className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">
                {t.freeEst}
              </button>
            </Link>
          </div>
          <div className="relative">
            <img src="/IMG_4870.jpeg" className="rounded-3xl shadow-2xl w-full object-cover" alt="Landscaping work" />
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className='bg-emerald-600 py-24 px-6'>
        <div className="max-w-6xl mx-auto text-white">
          <h1 className="text-5xl font-black mb-20 text-center text-emerald-900 drop-shadow-sm uppercase italic">
            {t.aboutTitle}
          </h1>

          <div className="space-y-24">
            {/* VISION */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2 aspect-video md:aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img src="IMG_6727.jpeg" className="w-full h-full object-cover" alt="Vision" />
              </div>
              <div className="w-full md:w-1/2">
                <h2 className="text-3xl font-bold mb-6 text-emerald-300">{t.ourVisionTitle}</h2>
                <p className="text-emerald-50 text-lg leading-relaxed">{t.ourVision}</p>
              </div>
            </div>

            {/* MISSION */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="w-full md:w-1/2 aspect-video md:aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img src="IMG_56492.jpeg" className="w-full h-full object-cover" alt="Mission" />
              </div>
              <div className="w-full md:w-1/2">
                <h2 className="text-3xl font-bold mb-6 text-emerald-300">{t.ourMissionTitle}</h2>
                <p className="text-emerald-50 text-lg leading-relaxed">{t.ourMission}</p>
              </div>
            </div>


            {/* EXPERIENCE */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2 aspect-video md:aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img src="/IMG_7690.jpeg" className="w-full h-full object-cover" alt="Vision" />
              </div>
              <div className="w-full md:w-1/2">
                <h2 className="text-3xl font-bold mb-6 text-emerald-300">{t.ourExperienceTitle}</h2>
                <p className="text-emerald-50 text-lg leading-relaxed">{t.ourExperience}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* EXAMPLES SECTION (Mosaico) */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-7xl mx-auto">    
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-emerald-900 mb-4">{t.imagesTitle}</h2>
            <p className="text-xl text-emerald-600 font-medium italic">{t.imgDesc}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[200px]">
            {['garden1.webp', 'garden2.webp', 'garden3.webp', 'garden5.webp'].map((img, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedImg(`/${img}`)} 
                className={`rounded-3xl overflow-hidden group relative cursor-pointer shadow-lg ${idx === 0 ? 'col-span-2 row-span-2' : ''} ${idx === 3 ? 'col-span-2' : ''}`}
              >
                <img src={`/${img}`} alt={`Project ${idx}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                  <span className="text-white text-4xl font-light">+</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODAL ZOOM */}
      {selectedImg && (
        <div 
          className="fixed inset-0 .z-[100] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setSelectedImg(null)}
        >
          <img src={selectedImg} className="max-w-full max-h-full rounded-lg shadow-2xl" alt="Zoomed" />
        </div>
      )}

      {/* WHY CHOOSE US */}
      <section className="py-24 px-6 max-w-7xl mx-auto bg-stone-50">
        <div className="bg-emerald-900 rounded-[3rem] p-12 lg:p-20 text-white flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-4xl font-bold mb-8">{t.whyUs}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {t.whyPoints.map(point => (
                <div key={point} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px]">✓</div>
                  {point}
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2 text-center border-l border-emerald-800">
             <div className="text-6xl font-black text-emerald-400 mb-2">15+</div>
             <div className="text-xl font-medium opacity-80 italic">
               {lang === 'en' ? 'Years of Experience' : 'Años de Experiencia'}
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}