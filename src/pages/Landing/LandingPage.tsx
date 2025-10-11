import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SimpleLayout } from '../../layouts/AppLayout';
import landing1 from '../../assets/landing1.png';
import landing21 from '../../assets/landing21.png';
import landing22 from '../../assets/landing22.png';
import landing23 from '../../assets/landing23.png';
import { useNavigate } from 'react-router-dom';
import { default as curvedArrow } from '../../assets/icons/curvedArrow.svg';
import { default as freeToUse } from '../../assets/icons/freeToUse.svg';
import { default as exampleText } from '../../assets/icons/exampleText.svg' 

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export function LandingPage() {
  const navigate = useNavigate();
  const featureRefs = useRef<Array<HTMLDivElement | null>>([]);
  const ctaRef = useRef<HTMLDivElement>(null);

  // GSAP Animations
  useEffect(() => {
    // Typing animation for hero text
    // const heroText = 'introducing advance audit tool for dooh campaigns';
    const heroElement = document.querySelector('.hero-text');
    
    if (!heroElement) return;
    
    heroElement.textContent = ''; // Clear the text initially
    
    // Create cursor element
    const cursor = document.createElement('span');
    cursor.className = 'inline-block w-1 h-12 bg-[var(--primary)] ml-1 align-start border animate-blink';
    
    // Create a container for the text to avoid cursor jumping
    const textContainer = document.createElement('span');
    heroElement.appendChild(textContainer);
    heroElement.appendChild(cursor);

    // funtion to create colored text span
    const createColoredText = (text: string, colorClass: string = "") => {
      const span = document.createElement('span');
      if (colorClass) {
        span.className = colorClass;
      }
      span.textContent = text;
      return span;
    } 

    const heroTextParts = [
      { text: 'every impression counts ', colorClass: "" },
      { text: 'DOOH', colorClass: "text-textLandingViolet" },
      { text: ' your audit now!', colorClass: "" },
    ]

    let currentPartIndex = 0;
    let currentCharIndex = 0;
    let timeoutId: NodeJS.Timeout;

    // let i = 0;
    
    const typeWriter = () => {
      if (currentPartIndex < heroTextParts.length) {
        const part = heroTextParts[currentPartIndex];
        if (currentCharIndex < part.text.length) {
          if (currentCharIndex === 0 && part.colorClass) {
            const span = createColoredText("", part.colorClass);
            textContainer.appendChild(span);
            currentTextNode = span;
          } else if (currentCharIndex === 0) {
            currentTextNode = document.createTextNode("")
            textContainer.appendChild(currentTextNode)
          }

          if (currentTextNode.nodeType === Node.TEXT_NODE) {
            currentTextNode.nodeValue += part.text[currentCharIndex];
          } else if (currentTextNode instanceof HTMLElement) {
            currentTextNode.textContent += part.text[currentCharIndex];
          }

          currentCharIndex++;
          timeoutId = setTimeout(typeWriter, 50);
        } else {
          currentPartIndex++;
          currentCharIndex = 0;
          timeoutId = setTimeout(typeWriter, 50);
        }
      // }

      // if (i < heroText.length) {
      //   const char = document.createTextNode(heroText[i]);
      //   textContainer.appendChild(char);
      //   i++;
      //   timeoutId = setTimeout(typeWriter, 50); // Typing speed (ms)
      } else {
        // Remove cursor when done
        cursor.remove();
        // Animate other elements after typing is done
        gsap.fromTo(
          '.hero-subtitle, .hero-buttons',
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out'
          }
        );
      }
    };

    let currentTextNode: Node | HTMLElement = document.createTextNode("");
    textContainer.appendChild(currentTextNode);
    
    // Animation starts automatically due to requestAnimationFrame
    const animationFrame = requestAnimationFrame(() => {
      timeoutId = setTimeout(typeWriter, 50);
    });

    // Features animation
    featureRefs.current.forEach((feature, i) => {
      if (!feature) return;
      
      gsap.fromTo(
        feature,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: feature,
            start: 'top 80%',
            toggleActions: 'play none none none'
          },
          delay: i * 0.2
        }
      );
    });

    // CTA animation
    if (ctaRef.current) {
      gsap.fromTo(
        ctaRef.current,
        { scale: 0.95, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    // Cleanup function
    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(timeoutId);
      // Remove cursor if it exists
      if (cursor.parentNode === heroElement) {
        heroElement.removeChild(cursor);
      }

      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const features = [
    {
      // icon: '🚀',
      icon: "fi fi-sr-shield-check flex items-center",
      title: 'Independent Third-party Verfication Tool',
      description: 'Ensure unbiased assessment of ad plays, free from media owner conflicts of interest'
    },
    {
      // icon: '🎨',
      icon: "fi fi-sr-camera flex items-center",
      title: 'Verification Of Ground Truth Data',
      description: 'Capture time-stamped, geo tagged photographic and video evidence from actual screen locations'
    },
    {
      // icon: '🔒',
      icon: "fi fi-sr-artificial-intelligence flex items-center",
      title: 'AI-Powered cross verification',
      description: 'Our advanced AI engine cross-references visual proof with the cms log report to detect discrepancies and ensure accuracy'
    }
  ];

  const text2 = [{
    heading: "Was the ad actually displayed on the site?",
    subHeading: "Relying solely on media owner reports present a clear conflict of interest leaving you without independent verification",
    number: 1
  },{
    heading: 'Was the screen even operational on time?',
    subHeading: "Malfunctions, power outages, and technical glitches create 'ghost impressions' - reported displays that never actually happened, directly wasting your valuable advertising budget.",
    number: 2
  },{
    heading: 'Did it run at the right time and place?',
    subHeading: "A single missed primetime slot or incorrect location can severly cripple a campaign's react and effectiveness, impacting overall ROI",
    number: 3
  }];

  const text3 = [
    "Easy & Quick Installation",
    "Image Analysis",
    "Log Analysis",
    "Custom Reporting",
    "API Acess",
    "Real-Time Monitoring"
  ]

  const pricingText = [{
    left: "free",
    right: "trial",
    title: "₹ 0",
    bullets: [
      "Analyse one campaign data",
      "Analyse one screen data",
      "Slot delivery validation",
      "Loop delivery validation",
      "Monitoring proof analysis"
    ],
    buttonText: "Start Free",
    selected: false,
  },{
    left: "pro",
    right: "trial",
    title: "₹ 599/site",
    bullets: [
      "Analyse one campaign data",
      "Slot delivery validation",
      "Loop delivery validation",
      "Monitoring proof analysis",
      "Generate Campaign Report"
    ],
    buttonText: "Choose Growth",
    selected: true,
  },{
    left: "enterprise",
    right: "custom",
    title: "Contact Us",
    bullets: [
      "All Pro features",
      "Customized campaign filters",
      "Dedicated dashboard",
      "Integrated chat assistant",
      "Customised measurement"
    ],
    buttonText: "Choose Growth",
    selected: false,
  }]

  const flowText = [{
    image: landing21,
    right: "Step 1",
    heading: "Plan",
    subHeading: "Effortlessly upload your complete campaign schedule, screen locations, and creative assets to our secure, intuitive platform."
  },{
    image: landing22,
    right: "Step 2",
    heading: "Analysis",
    subHeading: "Our sophisticated AI engine instantly analyzes the visual data, cross-referencing it with media owner logs to swiftly detect any discrepancies."
  },{
    image: landing23,
    right: "Step 3",
    heading: "Report",
    subHeading: "Access a  comprehensive client-ready reports that provides complete picture of your campaign."
  }]

  return (
    <SimpleLayout>
      <div className="absolute inset-0 -z-10 overflow-hidden w-3/4 mt-32 ml-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,rgba(0,0,0,0.03)_70%)] -z-10 pointer-events-none"></div>
        <div className="absolute inset-0 grid grid-cols-12 gap-4 opacity-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={`h-full border-gray-400 ${i === 11 ? "last:border-r-0" : "border-r"}`}></div>
          ))}
        </div>
        <div className="absolute inset-0 grid grid-rows-12 gap-8 opacity-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={`w-full border-gray-400 ${i === 11 ? "last:border-b-0" : "border-b"}`}></div>
          ))}
        </div>
      </div>
      {/* Hero Section */}
      <section className="flex items-center justify-center text-center p-16 relative">
        <div className="max-w-6xl mx-auto hero-content grid md:grid-cols-12 sm:grid-cols-6">
          <div className="col-span-6 py-8 ">
            <p className="text-left text-md pb-4 text-[var(--text-muted)]"># AI powered</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--text)] min-h-[84px] md:min-h-[112px] flex items-center justify-start">
              <span className="text-left text-start hero-text"></span>
            </h1>
            <p className="hero-subtitle text-left text-md md:text-md text-[var(--text-muted)] mb-10 max-w-3xl mx-auto opacity-0">
              Audit and analyse your DOOH campaign execution and results to reduce wastage from your campaign cost.
            </p>
            <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-start opacity-0">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="px-8 py-3 w-full bg-textLandingViolet text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                Get Started
              </button>
            </div>
            <div className="hero-buttons absolute -ml-28 opacity-0">
              <img src={curvedArrow} alt="free to use" className="" />
              <img src={freeToUse} alt="free to use" className="ml-10 -mt-3" />
            </div>
          </div>
          <div className="relative col-span-6">
            <div className="absolute w-full h-full flex flex-col justify-between gap-8 md:px-10">
              <div className="h-32 flex items-center justify-end">
                <span className="bg-violetLight rounded-xl h-full w-32 max-h-32 max-w-32"></span>
              </div>
              <div className="h-32 flex items-center justify-start">
                <span className="bg-violetLight rounded-full h-full w-32 max-h-32 max-w-32"></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-violet flex items-center justify-center text-center md:px-8 px-8">
        <div className="max-w-8xl mx-auto hero-content grid md:grid-cols-12 sm:grid-cols-6 gap-2 z-10">
          <div className="col-span-6 py-16 lg:px-20">
            <div className="flex items-top justify-start">
              <span
                className="px-8 py-3 bg-orange2 text-sm text-white rounded-full hover:opacity-90 transition-opacity font-medium"
              >
                Problem
              </span>
            </div>
            <div className="flex flex-col gap-2 pt-4 pb-8">
              <h1 className="text-3xl font-semibold text-white text-left flex items-center flex-wrap">
                Your DOOHbudget is leaking. You just can't prove it. {"\u2639"} {"\u2639"} {"\u2639"}
              </h1>
              <p className="text-sm text-white text-left">
                Discrepencies in DOOH campaigns are hard to spot, so are the negative impacts of it.
              </p>
            </div>
            <div className="mt-4 flex bg-backgroundCardViolet rounded-md grid md:grid-cols-5 sm:grid-cols-2 gap-2 p-4">
              <div className="col-span-2">
                <img className="rounded-md h-28 w-full" src={landing1} alt="" />
              </div>
              <div className="md:col-span-3 col-span-2 p-2">
                <p className="text-sm text-white text-left">
                  This persistent lack of verifiable data erodes trust, complicates ROI calculations, and
                  places your brand on the defensive, making it difficult to showcase true value.
                </p>
              </div>
            </div>
            <div className="absolute">
              
              <img src={exampleText} alt="exampleText" />
            </div>
          </div>
          <div className="col-span-6 h-120 overflow-scroll no-scrollbar lg:pl-32 lg:pr-16 mt-16">
            {text2?.map((txt: {heading: string, subHeading: string, number: number}, index: number) => (
              <div key={index} className="my-2 bg-white rounded-2xl flex items-center justify-between p-8">
                <div className="w-3/4 flex flex-col gap-2">
                  <h1 className="text-lg text-primaryText text-left font-bold">{txt.heading}</h1>
                  <p className="text-sm text-primaryText text-left">{txt.subHeading}</p>
                </div>
                <h1 className="w-1/4 text-7xl text-textLandingViolet">{txt.number}</h1>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:px-16 px-8 bg-backgroundLandingAlt">
        <div className="max-w-7xl mx-auto">
          <p className="text-md font-semibold text-textLandingViolet">Introducing oohdit</p>
          <h2 className="py-2 text-3xl md:text-4xl font-bold text-left text-primaryText">
            Your Unbiased Proof of Performance
          </h2>
          <p className="text-left text-primaryText mb-16">Analyse your campaign performance using the the evidence provided and audit your campaigns and learn from them</p>
          <div className="grid md:grid-cols-3 gap-8 pt-2 pb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                ref={(el) => {
                  if (el) featureRefs.current[index] = el;
                  return undefined;
                }}
                className="col-span-1 bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="mb-4 rounded-full bg-violet p-4 w-1/4 flex items-center justify-center">
                  <i className={`text-4xl text-white ${feature.icon}`}></i>
                </div>
                <h3 className="text-xl font-bold mb-3 text-primaryText">
                  {feature.title}
                </h3>
                <p className="text-sm text-primaryText">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="md:px-16 px-8 -mt-16">
        <div className="max-w-7xl bg-violet mx-auto md:p-16 p-8 rounded-3xl text-white">
          <p className="text-md text-textLandingYellow">why choose us</p>
          <h2 className="pt-2 pb-4 text-3xl md:text-4xl font-bold text-left text-[var(--text)]">
            We deliver "Ground Truth"
          </h2>
          <p className="text-left text-sm text-[var(--text-muted)]">
            We don't just analyze server logs. Our platform empowers your on-ground teams to capture time-stamped, geo-tagged photographic and video evidence, which is then cross-verified against log data by our Al engine. The result is irrefutable proof of play, ensuring every impression counts
          </p>
        </div>
      </section>

      <section className="md:px-16 px-8 py-16">
        <div className="max-w-7xl mx-auto rounded-xl">
          <p className="text-md font-semibold text-textLandingViolet">how do we do it</p>
          <h2 className="py-2 text-3xl md:text-4xl font-bold text-left text-[var(--text)]">
            Seamless Integration, Irrefutable Proofs
          </h2>
          <p className="text-left text-sm text-[var(--text-muted)]">
            Market Opportunity: ₹6.9 lakh crore DOOH market growing at 12% annually, with verification representing a ₹4,250+ crore addressable market.
          </p>

          {flowText?.map((txt: {image: string, right: string, heading: string, subHeading: string}, index: number) => (
            <div key={index} className="p-4 bg-violetLight rounded-lg my-4">
              <div className="flex items-center justify-end py-2">
                <p className="font-semibold text-violet text-xs">{txt.right}</p>
              </div>
              <div className="grid md:grid-cols-12 sm:grid-cols-4 lg:gap-8 gap-4">
                <div className="col-span-4 w-full">
                  <img className="rounded-md w-full" src={txt.image} alt="" />
                </div>
                <div className="md:col-span-8 sm:col-span-4 lg:space-y-4">
                  <h1 className="text-2xl font-semibold text-left text-[var(--text)]">{txt.heading}</h1>
                  <p className="text-left text-sm text-[var(--text-muted)]">
                    {txt.subHeading}
                  </p>
                </div>
              </div>
            </div>
          ))}
          

        </div>
      </section>

      <section className="px-16 pb-16">
        <div className="max-w-7xl mx-auto">
          <p className="text-md font-semibold text-textLandingViolet">Oohdit</p>
          <h2 className="py-2 text-3xl md:text-4xl font-bold text-left text-[var(--text)]">Built For Every Roles</h2>
          <p className="text-left text-sm text-[var(--text-muted)]">
            Advanced AI-powered auditing platform that is capable of real-time campaign monitoring, comprehensive reporting, and actionable insights at a fraction of enterprise costs.
          </p>

          <div className="mt-4 rounded-xl bg-violet p-8">
            <p className="text-md font-semibold text-white">See Use Case For Your Business</p>
            <div className="grid md:grid-cols-12 sm:grid-cols-6 gap-8 py-4">
              <div className="col-span-4 bg-white rounded-lg p-4 text-primaryText">
                <div className="h-44 pt-2">
                  <h1 className="text-2xl font-semibold text-left">
                    Agencies
                  </h1>
                  <p className="py-4 text-left text-sm text-primaryText">
                    Matching monitoring pics and log repots is a tedious process, which is often overlooked resulting in wastage of campaign budget.
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-orange1">
                  <span className="flex gap-2 items-center">
                    <i className="fi fi-ss-check-circle text-primaryText items-center justify-center"></i>
                    <p className="text-xs font-semibold">
                      Match monitoring pics logs
                    </p>
                  </span>
                  <span className="flex gap-2 items-center">
                    <i className="fi fi-ss-check-circle text-primaryText items-center justify-center"></i>
                    <p className="text-xs font-semibold">
                      Compare campaign deliverables
                    </p>
                  </span>
                  <span className="flex gap-2 items-center">
                    <i className="fi fi-ss-check-circle text-primaryText items-center justify-center"></i>
                    <p className="text-xs font-semibold">
                      Generate reports in seconds
                    </p>
                  </span>
                </div>
              </div>
              
              <div className="col-span-4 bg-white rounded-lg p-4 text-primaryText">
                <div className="h-44 pt-2">
                  <h1 className="text-2xl font-semibold text-left">
                    Brands
                  </h1>
                  <p className="py-4 text-left text-sm text-primaryText">
                    Trust the agency reports without any verification proof, taking misleading data to measure campaign performance and loosing campaign's impact.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-green1">
                  <span className="flex gap-2 items-center">
                    <i className="fi fi-ss-check-circle text-primaryText items-center justify-center"></i>
                    <p className="text-xs font-semibold">
                      Match monitoring pics with logs
                    </p>
                  </span>
                  <span className="flex gap-2 items-center">
                    <i className="fi fi-ss-check-circle text-primaryText items-center justify-center"></i>
                    <p className="text-xs font-semibold">
                      Compare campaign deliverables
                    </p>
                  </span>
                  <span className="flex gap-2 items-center">
                    <i className="fi fi-ss-check-circle text-primaryText items-center justify-center"></i>
                    <p className="text-xs font-semibold">
                      Measuse DOOH campaign
                    </p>
                  </span>
                </div>
              </div>

              <div className="col-span-4 bg-white rounded-lg p-4 text-primaryText">
                <div className="h-44 pt-2">
                  <h1 className="text-2xl font-semibold text-left">
                    Media Owners
                  </h1>
                  <p className="pt-2 pb-4 text-left text-sm text-primaryText">
                    Employee an army of monitoring people for site monitoring, still lacking real time information on descrepencies in campaign's deliverables.
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-blue1">
                  <span className="flex gap-2 items-center">
                    <i className="fi fi-ss-check-circle text-primaryText items-center justify-center"></i>
                    <p className="text-xs font-semibold">
                      Authenticate log reports
                    </p>
                  </span>
                  <span className="flex gap-2 items-center">
                    <i className="fi fi-ss-check-circle text-primaryText items-center justify-center"></i>
                    <p className="text-xs font-semibold">
                      Site health monitoring
                    </p>
                  </span>
                  <span className="flex gap-2 items-center">
                    <i className="fi fi-ss-check-circle text-primaryText items-center justify-center"></i>
                    <p className="text-xs font-semibold">
                      Real-time notification
                    </p>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 md:px-16 px-8 py-16 bg-backgroundLandingAlt rounded-t-3xl">
        <div className="-mt-28 md:p-16 p-8 grid md:grid-cols-12 sm:grid-cols-6 md:gap-16 sm:gap-8 max-w-7xl mx-auto bg-navyBlue rounded-2xl">
          <div className="md:col-span-5 sm:col-span-6 md:px-12">
            <h1 className="text-white text-3xl font-bold">
              Features That Blow Your Mind
            </h1>
            <p className="text-white text-sm py-4">
              Advanced AI-powered auditing platform that provides real-time campaign monitoring, comprehensive reporting, and actionable insights at a fraction of enterprise costs.
            </p>
          </div>
          <div className="md:col-span-7  sm:col-span-6 flex flex-wrap gap-2 items-center justify-center md:px-24">
            {text3.map((txt: string, i: number) => (
              <div key={i} className="rounded-full px-4 py-2 bg-backgroundCardNavyBlue flex items-center justify-center">
                <p className="md:text-md sm:text-sm text-white">{txt}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-backgroundLandingAlt rounded-b-3xl md:px-16 px-8 py-16">
        <div className="flex flex-col items-center justify-center">
          <p className="text-md font-semibold text-textLandingViolet">pay-as-you-go</p>
          <h1 className="text-3xl font-bold py-2 text-primaryText">
            Affordable Cost For Your Expensive Campaigns
          </h1>
          <p className="text-sm text-primaryText">
            Transparent, flexible and designed for DOOH teams of every size
          </p>
          <div className="grid md:grid-cols-12 sm:grid-cols-4 md:gap-16 sm:gap-8 gap-4 py-8 text-primaryText">
            {pricingText?.map((item: {left: string, right: string, title: string, bullets: string[], buttonText: string, selected: boolean}, i: number) => (
              <div key={i} className={`col-span-4 rounded-lg bg-white p-4 ${item.selected ? "border border-textLandingViolet" : ""}`}>
                {item.selected && <div className="flex items-center justify-end -mt-7">
                  <span className="bg-sun py-1 px-4 rounded-full">
                    <p className="text-xs font-bold">most popular</p>
                  </span>
                </div>}
                <div className="flex items-center justify-between py-1">
                  <p className="text-sm font-semibold">
                    {item.left}
                  </p>
                  <span className={`${item.selected ? "" : "bg-gray-100"} py-1 px-4 rounded-full`}>
                    <p className={`text-sm ${item.selected ? "text-white" : "text-gray-500"}`}>{item.right}</p>
                  </span>
                </div>
                <div className="p-4">
                  <h1 className="text-4xl text-primaryText font-bold truncate">{item.title}</h1>
                  <ul role="list" className="py-4 list-disc marker:text-textLandingViolet">
                    {item.bullets.map((bullet: string, j: number) => (
                      <li key={j} className="p-1 text-sm">{bullet}</li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  className={`w-full px-8 py-3 ${item.selected ? "bg-textLandingViolet text-white" : "border border-black bg-white text-black"}  text-sm rounded-full hover:bg-opacity-90 transition-opacity font-medium`}
                  onClick={() =>
                    window.location.href =
                      `mailto:kishankrsingh0822@gmail.com?subject=Oohdit ${item.left} package cost inquiry&body=Hi, I would like to get in touch to know more about this product and the costs related to it.`
                  }
                >
                  {item.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="md:px-16 px-8 py-16">
        <div className="flex flex-col items-center justify-center">
          <p className="text-md font-semibold text-textLandingViolet">We would love to hear from you</p>
          <h1 className="text-3xl font-bold py-2">
            Get in touch
          </h1>
          <p className="text-sm">
            Click on the button below and write to us about your queries, our suppor executives will get back to you as soon as possible
          </p>
          <button
            type="button"
            onClick={() =>
              window.location.href =
                "mailto:kishankrsingh0822@gmail.com?subject=Oohdit Inquiry&body=Hi, I would like to get in touch to know more about this product."
            }
            className="my-4 px-8 py-3 bg-textLandingViolet text-white rounded-full hover:bg-opacity-90 transition-opacity font-medium"
          >
            Get in touch
          </button>
        </div>
      </section>



      {/* CTA Section */}
      <section className="md:px-16 py-16 px-8 text-black bg-textLandingViolet">
        <div 
          ref={ctaRef}
          className="max-w-4xl mx-auto text-center bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] p-12 rounded-2xl"
        >
          <p className="text-textLandingYellow text-xl mb-8 opacity-90">
            let us work together
          </p>
          <h2 className="text-3xl text-white md:text-4xl font-bold mb-6">
            Ready to audit your DOOH campaigns?
          </h2>
          <p className="text-sm text-white mb-8 opacity-90">
            Join today and get a dedicated dashboard to audit all your DOOH campaigns
          </p>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="px-8 py-3 bg-white rounded-lg hover:bg-opacity-90 transition-opacity font-medium"
          >
            Try Now
          </button>
        </div>
      </section>
      <section className="p-16 bg-primaryText">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xs text-violetLight font-semibold">Contact Details</h1>
            <p className="text-sm text-violetLight">We would love to hear from you</p>
            <p className="text-sm text-violetLight">Call us @ +91 9572 168 043</p>
          </div>
          <div className="h-8 flex items-center gap-1">
            <div className="border-2 border-violet rounded-full">
              <h1 className="text-white text-xl font-semibold px-1.5">O</h1>
            </div>
            <h1 className="text-white text-xl font-semibold">O H D I T</h1>
          </div>
        </div>
      </section>
    </SimpleLayout>
  );
}
