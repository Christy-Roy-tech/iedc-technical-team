(function renderExecomCards() {
  var members = [
    {
      name: "Steny Thankkam Raju",
      role: "Student Lead I",
      image: "assets/img/execom/2526/steny-thankkam-raju.jpeg",
      bio: "Leads overall execution of IEDC initiatives and keeps teams aligned on outcomes.",
    },
    {
      name: "Mathew Tito",
      role: "Student Lead II",
      image: "assets/img/execom/2526/mathew-tito.jpeg",
      bio: "Supports strategic planning and coordination across events, projects, and collaborations.",
    },
    {
      name: "Lakshmi Ratheesan",
      role: "Women Innovation Lead",
      image: "assets/img/execom/2526/lakshmi-ratheesan.jpeg",
      bio: "Builds an inclusive innovation culture by enabling women-led ideas and initiatives.",
    },
    {
      name: "Amina Sidhyc",
      role: "Quality and Operations Lead",
      image: "assets/img/execom/2526/amina-sidhyc.jpeg",
      bio: "Improves operational quality and ensures process consistency across all team activities.",
    },
    {
      name: "Shanima Shaji",
      role: "Finance Lead",
      image: "assets/img/execom/2526/shanima-shaji.jpeg",
      bio: "Oversees budgets and spending plans to keep initiatives financially healthy and sustainable.",
    },
    {
      name: "Niz Maria Roy",
      role: "Branding and Marketing Lead",
      image: "assets/img/execom/2526/niz-maria-roy.jpeg",
      bio: "Shapes brand visibility through campaigns, communication strategy, and outreach.",
    },
    {
      name: "Adithyan B",
      role: "Community Lead",
      image: "assets/img/execom/2526/adithyan-b.jpeg",
      bio: "Strengthens community engagement through collaboration, networking, and participation.",
    },
    {
      name: "Ashin K Suresh",
      role: "Creative and Innovation Lead",
      image: "assets/img/execom/2526/ashin-k-suresh.jpeg",
      bio: "Drives creative direction for innovation storytelling, ideation, and campaign assets.",
    },
    {
      name: "Richu V Prakash",
      role: "Technical Lead",
      image: "assets/img/execom/2526/richu-v-prakash.jpeg",
      bio: "Guides technical execution for products, prototypes, and engineering-focused initiatives.",
    },
    {
      name: "Sarang Krishna R",
      role: "IPR and Research Lead",
      image: "assets/img/execom/2526/sarang-krishna-r.jpeg",
      bio: "Leads research and IP documentation to support idea protection and responsible innovation.",
    },
  ];

  var container = document.getElementById("execom-cards");
  if (!container) {
    return;
  }

  var cards = members
    .map(function (member, index) {
      var delay = 100 + ((index % 4) * 100);
      return (
        '<article class="member d-flex align-items-start" data-aos="zoom-in" data-aos-delay="' +
        delay +
        '">' +
        '<div class="pic">' +
        '<img src="' +
        member.image +
        '" class="img-fluid" alt="Portrait of ' +
        member.name +
        '" loading="lazy" />' +
        '</div>' +
        '<div class="member-info">' +
        '<h4>' +
        member.name +
        '</h4>' +
        '<span>' +
        member.role +
        '</span>' +
        '<p>' +
        member.bio +
        '</p>' +
        '</div>' +
        '</article>'
      );
    })
    .join("");

  container.innerHTML = cards;
})();
