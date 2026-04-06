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
    idleVideoUrl: "",
    perPage: 9,
    resetTimer: 60,
    superAdminPin: "0000",
    adminPin: "1111",
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
        type: "office",
      },
      {
        office: "Finance and Administrative Division",
        contact: "8876-3454 loc. 8303",
        type: "office",
      },
      {
        office: "Local Government Capability Development Division",
        contact: "8876-3454 loc. 8304",
        type: "office",
      },
      {
        office: "Local Government Monitoring and Evaluation Division",
        contact: "8876-3454 loc. 8305",
        type: "office",
      },
      {
        office: "Agusan del Norte",
        address: "Matimco Bldg., J.C. Aquino Ave., Libertad, Butuan City, Agusan del Norte",
        contact: "8876-3454 loc. 8311",
        type: "province",
      },
      {
        office: "Agusan del Sur",
        address: "Municipality of Prosperidad Hall, National Highway, Prosperidad City, Agusan del Sur",
        contact: "8876-3454 loc. 8321",
        type: "province",
      },
      {
        office: "Dinagat Islands",
        address: "Brgy. Cuarinta, San Jose, Dinagat Islands",
        contact: "8876-3454 loc. 8331",
        type: "province",
      },
      {
        office: "Surigao del Norte",
        address: "City Hall Compound, Surigao City, Surigao del Norte",
        contact: "8876-3454 loc. 8341",
        type: "province",
      },
      {
        office: "Surigao del Sur",
        address: "Lianga, Surigao del Sur",
        contact: "8876-3454 loc. 8351",
        type: "province",
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
  calendarEvents: [
    {
      id: "evt-1",
      date: "2026-03-04",
      title: "Citizen Service Frontline Briefing",
      time: "9:00 AM - 10:30 AM",
      location: "Regional Conference Hall",
      category: "internal",
      office: "Regional Director Office",
      description: "Frontline teams align on service updates, queue handling, and citizen support protocols.",
    },
    {
      id: "evt-2",
      date: "2026-03-09",
      title: "Barangay Documentation Assistance",
      time: "1:30 PM - 4:00 PM",
      location: "Public Service Desk",
      category: "external",
      office: "Customer Assistance Unit",
      description: "Assistance day for documentary requirements and step-by-step filing guidance.",
    },
    {
      id: "evt-3",
      date: "2026-03-14",
      title: "Submission Deadline: Monthly Compliance Report",
      time: "Until 5:00 PM",
      location: "Online Submission Portal",
      category: "deadline",
      office: "Monitoring and Evaluation Division",
      description: "All covered offices must submit required compliance attachments before cutoff.",
    },
    {
      id: "evt-4",
      date: "2026-03-14",
      title: "Civil Registry Coordination Meeting",
      time: "2:00 PM - 3:30 PM",
      location: "Meeting Room 2",
      category: "internal",
      office: "LG Capability Development Division",
      description: "Coordination with support units for upcoming local registry assistance programs.",
    },
    {
      id: "evt-5",
      date: "2026-03-21",
      title: "Public Consultation on Local Governance Programs",
      time: "10:00 AM - 12:00 PM",
      location: "Main Lobby Forum Area",
      category: "external",
      office: "Public Affairs and Communication",
      description: "Open consultation for citizens regarding service improvements and outreach initiatives.",
    },
    {
      id: "evt-6",
      date: "2026-03-29",
      title: "Special Non-Working Holiday",
      time: "Whole Day",
      location: "All Offices",
      category: "holiday",
      office: "DILG Region XIII",
      description: "Office operations follow holiday schedule. Emergency support lines remain available.",
    },
    {
      id: "evt-7",
      date: "2026-04-03",
      title: "Inter-Office Service Standards Workshop",
      time: "9:00 AM - 11:30 AM",
      location: "Training Room A",
      category: "internal",
      office: "Human Resource Development",
      description: "Workshop focused on standardizing service touchpoints and processing updates.",
    },
    {
      id: "evt-8",
      date: "2026-04-08",
      title: "External Services Info Day",
      time: "8:30 AM - 3:00 PM",
      location: "Ground Floor Help Desk",
      category: "external",
      office: "Citizen Engagement Unit",
      description: "Walk-in orientation for service requirements and expected processing timelines.",
    },
  ],
  announcements: [
    {
      id: "ann-1",
      title: "Service Advisory",
      message: "Partial downtime for online request tracking on March 31, 2026.",
      details:
        "Online request tracking may be temporarily unavailable from 1:00 PM to 3:00 PM due to scheduled maintenance. Walk-in and help desk support remain available during this period.",
      postedBy: "ICT Support Unit",
      where: "Online Tracking Portal and Help Desk",
      postedOn: "2026-03-28",
      effectiveUntil: "2026-03-31",
      involvedParties: "Walk-in clients, Help Desk Staff",
      tickerDisplay: "message",
      attachments: [
        { name: "Advisory PDF", url: "https://example.com/advisory.pdf" },
      ],
    },
    {
      id: "ann-2",
      title: "Public Consultation",
      message: "Citizen consultation on local governance programs this Friday.",
      details:
        "Open forum will be conducted at the Main Lobby Forum Area, 10:00 AM to 12:00 PM. Citizens are encouraged to submit feedback and service recommendations.",
      postedBy: "Public Affairs Office",
      where: "Main Lobby Forum Area",
      postedOn: "2026-03-27",
      effectiveUntil: "2026-04-05",
      involvedParties: "Citizens, LGU Representatives, Program Officers",
      tickerDisplay: "title",
      attachments: [
        { name: "Event Poster", url: "https://example.com/consultation-poster.jpg" },
        { name: "Program Agenda", url: "https://example.com/consultation-agenda.pdf" },
      ],
    },
  ],
  programs: [
    {
      id: "prog-1",
      title: "DILG Strategic Initiatives Overview",
      description: "Introduction to DILG's key programs and initiatives focused on strengthening local governance.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      category: "General Overview",
      uploadedDate: "2026-02-15",
    },
    {
      id: "prog-2",
      title: "Peace and Order Program (PBEST)",
      description: "Learn about DILG's Peace and Order Program and its community benefits.",
      videoUrl: "https://www.youtube.com/embed/jNQXAC9IVRw",
      category: "Programs",
      uploadedDate: "2026-02-20",
    },
    {
      id: "prog-3",
      title: "Local Governance Excellence Tips",
      description: "Short tips and insights on improving local governance practices.",
      videoUrl: "https://www.youtube.com/embed/Ks-_Mh1QhMc",
      category: "Training",
      uploadedDate: "2026-03-01",
    },
  ],
};
