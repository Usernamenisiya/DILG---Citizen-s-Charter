import leaveIcon from "../assets/icons/leave.png";
import travelIcon from "../assets/icons/travel.png";
import certIcon from "../assets/icons/certification.png";
import equipmentIcon from "../assets/icons/equipment.png";
import vehicleIcon from "../assets/icons/vehicle.png";
import procurementIcon from "../assets/icons/procurement.png";
import claimsRoIcon from "../assets/icons/claims-regional.png";
import claimsPoIcon from "../assets/icons/claims-provincial.png";
import ictIcon from "../assets/icons/ict.png";
import legalIcon from "../assets/icons/legal.png";

export const KIOSK_DEFAULT_DATA = {
  version: 5,
  lastUpdated: new Date().toISOString(),
  settings: {
    kioskTitle: "Citizen's Charter Information Kiosk",
    office: "DILG Region XIII (Caraga)",
    address: "Purok 1-A, Doongan, Butuan City",
    tagline: "Matino, Mahusay at Maaasahan ",
    hours: "Monday to Friday, 8:00 AM - 5:00 PM",
    perPage: 9,
    resetTimer: 60,
    adminPin: "0000",
    updateUrl: "",
    autoCheckUpdates: false,
  },
  feedbackAndComplaints: {
    title: "Feedback and Complaints Mechanism",
    contact: {
      email: "paccrecords@gmail.com",
      telephone: "(02) 8925-0343",
    },
    sections: [
      {
        heading: "How to send feedback?",
        paragraphs: [
          "Accomplish the Client Satisfaction Survey form after receiving your requested service from our action officers.",
          "For other concerns, you may send an e-mail at paccrecords@gmail.com or call the telephone number (02) 8925-0343.",
        ],
      },
      {
        heading: "How feedback is processed?",
        paragraphs: [
          "Feedback on our services are immediately attended to by the concerned action officer.",
          "Other feedback and concerns are endorsed by the Public Assistance and Complaints Center (PACC) to the appropriate office. Upon receiving the reply from the concerned office/personnel, the client will be informed via e-mail/phone call/letter.",
        ],
      },
      {
        heading: "How to file complaint?",
        paragraphs: [
          "For walk-ins at the Central Office: Accomplish the Client's Complaint Form available at the DILG Helpdesk at the Ground Floor, DILG-NAPOLCOM Center, EDSA cor. Quezon Avenue, West Triangle, Quezon City (Central Office).",
          "For walk-ins at the Regional, Provincial, and Field Offices: Approach the Desk Officer of the Day and accomplish the Client's Complaint Form.",
          "Online: Send an e-mail to paccrecords@gmail.com and provide the required details below.",
        ],
        items: [
          "Name (optional) and contact number of the complainant",
          "Narrative/details of the complaint",
          "Name of the office/LGU and/or official being complained",
        ],
      },
      {
        heading: "How complaints are processed?",
        paragraphs: [
          "All complaints received will be reviewed by the PACC or the Desk Officer of the Day and endorsed to the concerned office for a reply or an appropriate action.",
          "The PACC or the DILG Regional Office will provide feedback to the complainant via e-mail/letter.",
        ],
      },
    ],
  },
  officeDirectory: {
    title: "List of Offices",
    region: "Region XIII (Caraga Region)",
    entries: [
      {
        office: "Office of the Regional Director",
        address: "Brgy. Libertad, Butuan City, Agusan del Norte",
        contact: "8876-3454 loc. 8301",
      },
      {
        office: "Finance and Administrative Division",
        contact: "8876-3454 loc. 8303",
      },
      {
        office: "Local Government Capability Development Division",
        contact: "8876-3454 loc. 8304",
      },
      {
        office: "Local Government Monitoring and Evaluation Division",
        contact: "8876-3454 loc. 8305",
      },
      {
        office: "Agusan del Norte",
        address: "Matimco Bldg., J.C. Aquino Ave., Libertad, Butuan City, Agusan del Norte",
        contact: "8876-3454 loc. 8311",
      },
      {
        office: "Agusan del Sur",
        address: "Municipality of Prosperidad Hall, National Highway, Prosperidad City, Agusan del Sur",
        contact: "8876-3454 loc. 8321",
      },
      {
        office: "Dinagat Islands",
        address: "Brgy. Cuarinta, San Jose, Dinagat Islands",
        contact: "8876-3454 loc. 8331",
      },
      {
        office: "Surigao del Norte",
        address: "City Hall Compound, Surigao City, Surigao del Norte",
        contact: "8876-3454 loc. 8341",
      },
      {
        office: "Surigao del Sur",
        address: "Lianga, Surigao del Sur",
        contact: "8876-3454 loc. 8351",
      },
    ],
  },
  organizationalProfile: {
    title: "Mandate, Mission, Vision and Service Pledge",
    mandate:
      "To promote peace and order, ensure public safety and further strengthen local government capability aimed towards the effective delivery of basic services to the citizenry.",
    mission:
      "The Department shall ensure peace and order, public safety and security, uphold excellence in local governance and enable resilient and inclusive communities.",
    vision:
      "A highly trusted Department and Partner in nurturing local governments and sustaining peaceful, safe, progressive, resilient, and inclusive communities towards a comfortable and secure life for Filipinos by 2040.",
    servicePledge: {
      intro:
        "We in the DILG, imbued with the core values of Integrity, Commitment, Teamwork and Responsiveness, commit to formulate sound policies on strengthening local government capacities, performing oversight function over LGUs, and providing rewards and incentives.",
      serviceCommitment:
        "We pledge to provide effective technical and administrative services through professionalized corps of civil servants to promote excellence in local governance specifically in the areas of PBEST:",
      pbest: [
        "Peace and Order",
        "Business-Friendliness and Competitiveness",
        "Environment-Protection and Climate Change Adaptation",
        "Socially Protective and Safe Communities",
        "Transparency and Accountability",
      ],
      officeHoursCommitment:
        "We commit to attend to clients who are within the premises of the office prior to the end of official working hours and during lunch break.",
      closing:
        "We commit to consistently demonstrate a \"Matino, Mahusay at Maaasahang Kagawaran para sa Mapagkalinga at Maunlad na Pamahalaang Lokal\".",
    },
  },

  
  
};
