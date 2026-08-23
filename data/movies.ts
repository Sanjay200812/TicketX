import { TicketXMovie } from '@/types/movie';

export const movies: TicketXMovie[] = [
  {
    id: "debba-debba",
    title: "Debba Debba",
    poster: "/posters/debba-debba.jpg",
    backdrop: "/posters/debba-debba.jpg",
    language: "Telugu",
    genres: ["Action", "Comedy", "Drama"],
    duration: "2h 20m",
    rating: 8.7,
    certificate: "U/A",
    releaseDate: "2026-08-22",
    description: "An action-packed commercial mass entertainer following a fearless protagonist taking on high-stakes challenges.",
    cast: [
      { id: "c1", name: "Mass Hero Vijay", character: "Suri", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
      { id: "c2", name: "Ananya Rao", character: "Priya", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" },
      { id: "c3", name: "Rao Ramesh", character: "Dharma Raju", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
      { id: "c4", name: "Vennela Kishore", character: "Chanti", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80" }
    ],
    crew: [
      { id: "cr1", name: "Srinivas Reddy", role: "Director" },
      { id: "cr2", name: "Dil Raju", role: "Producer" },
      { id: "cr3", name: "Thaman S", role: "Music" },
      { id: "cr4", name: "Rathnavelu", role: "Cinematography" },
      { id: "cr5", name: "Karthika Srinivas", role: "Editor" }
    ]
  },
  {
    id: "irumudi",
    title: "Irumudi",
    poster: "/posters/irumudi.jpg",
    backdrop: "/posters/irumudi.jpg",
    language: "Telugu",
    genres: ["Drama", "Action"],
    duration: "2h 25m",
    rating: 8.8,
    certificate: "U/A",
    releaseDate: "2026-08-20",
    description: "A devotional action thriller following a sacred journey filled with high stakes, destiny, and deep emotions.",
    cast: [
      { id: "c5", name: "Sharwanand", character: "Swami", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80" },
      { id: "c6", name: "Sai Pallavi", character: "Devi", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
      { id: "c7", name: "Prakash Raj", character: "Guruji", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80" }
    ],
    crew: [
      { id: "cr6", name: "Vamshi Paidipally", role: "Director" },
      { id: "cr7", name: "Sudhakar Cherukuri", role: "Producer" },
      { id: "cr8", name: "M. M. Keeravani", role: "Music" },
      { id: "cr9", name: "P. S. Vinod", role: "Cinematography" }
    ]
  },
  {
    id: "vishwanath-and-sons",
    title: "Vishwanath and Sons",
    poster: "/posters/vishwanath-and-sons.jpg",
    backdrop: "/posters/vishwanath-and-sons.jpg",
    language: "Telugu",
    genres: ["Family", "Drama"],
    duration: "2h 15m",
    rating: 8.4,
    certificate: "U",
    releaseDate: "2026-08-15",
    description: "A heartwarming multi-generational family drama exploring bonds, legacy, and shared dreams across generations.",
    cast: [
      { id: "c8", name: "Nasser", character: "Vishwanath", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80" },
      { id: "c9", name: "Nani", character: "Abhi", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
      { id: "c10", name: "Mrunal Thakur", character: "Siri", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80" }
    ],
    crew: [
      { id: "cr10", name: "Shiva Nirvana", role: "Director" },
      { id: "cr11", name: "Sahu Garapati", role: "Producer" },
      { id: "cr12", name: "Hesham Abdul Wahab", role: "Music" }
    ]
  },
  {
    id: "insidious-out-of-the-further",
    title: "Insidious: Out of the Further",
    poster: "/posters/insidious-out-of-the-further.jpg",
    backdrop: "/posters/insidious-out-of-the-further.jpg",
    language: "English / Telugu",
    genres: ["Horror", "Mystery"],
    duration: "1h 52m",
    rating: 7.9,
    certificate: "A",
    releaseDate: "2026-08-14",
    description: "The dark entity from the Further attempts to cross into the waking realm in this terrifying horror chapter.",
    cast: [
      { id: "c11", name: "Lin Shaye", character: "Elise Rainier", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80" },
      { id: "c12", name: "Patrick Wilson", character: "Josh Lambert", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
      { id: "c13", name: "Ty Simpkins", character: "Dalton Lambert", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80" }
    ],
    crew: [
      { id: "cr13", name: "James Wan", role: "Producer" },
      { id: "cr14", name: "Leigh Whannell", role: "Writer" },
      { id: "cr15", name: "Joseph Bishara", role: "Music" }
    ]
  },
  {
    id: "paw-patrol-the-dino-movie",
    title: "PAW Patrol: The Dino Movie",
    poster: "/posters/paw-patrol-the-dino-movie.jpg",
    backdrop: "/posters/paw-patrol-the-dino-movie.jpg",
    language: "English / Telugu",
    genres: ["Animation", "Adventure", "Family"],
    duration: "1h 35m",
    rating: 8.1,
    certificate: "U",
    releaseDate: "2026-08-08",
    description: "The heroic pups embark on a prehistoric rescue mission when a lost dinosaur land needs their help.",
    cast: [
      { id: "c14", name: "Mckenna Grace", character: "Skye (Voice)", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
      { id: "c15", name: "Marsai Martin", character: "Liberty (Voice)", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" }
    ],
    crew: [
      { id: "cr16", name: "Cal Brunker", role: "Director" },
      { id: "cr17", name: "Heitor Pereira", role: "Music" }
    ]
  },
  {
    id: "fight-maha",
    title: "Fight Maha",
    poster: "/posters/fight-maha.jpg",
    backdrop: "/posters/fight-maha.jpg",
    language: "Telugu",
    genres: ["Action", "Thriller"],
    duration: "2h 10m",
    rating: 8.0,
    certificate: "U/A",
    releaseDate: "2026-08-21",
    description: "An intense martial arts action drama showcasing an underdog fighter rising against all odds.",
    cast: [
      { id: "c16", name: "Sundeep Kishan", character: "Maha", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
      { id: "c17", name: "Divyansha Kaushik", character: "Maya", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80" }
    ],
    crew: [
      { id: "cr18", name: "Ranjit Jeyakodi", role: "Director" },
      { id: "cr19", name: "Sam C. S.", role: "Music" }
    ]
  },
  {
    id: "khalifa-the-ruler",
    title: "Khalifa: The Ruler",
    poster: "/posters/khalifa-the-ruler.jpg",
    backdrop: "/posters/khalifa-the-ruler.jpg",
    language: "Telugu / Hindi",
    genres: ["Action", "Crime", "Drama"],
    duration: "2h 38m",
    rating: 8.9,
    certificate: "U/A",
    releaseDate: "2026-08-23",
    description: "An epic saga chronicling the rise of a visionary leader ruling the underworld with honor.",
    cast: [
      { id: "c18", name: "Prabhas", character: "Khalifa", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
      { id: "c19", name: "Deepika Padukone", character: "Ayesha", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
      { id: "c20", name: "Sanjay Dutt", character: "Kabir", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80" }
    ],
    crew: [
      { id: "cr20", name: "Prashanth Neel", role: "Director" },
      { id: "cr21", name: "Ravi Basrur", role: "Music" },
      { id: "cr22", name: "Bhuvan Gowda", role: "Cinematography" }
    ]
  },
  {
    id: "dc",
    title: "DC",
    poster: "/posters/dc.jpg",
    backdrop: "/posters/dc.jpg",
    language: "Telugu / English",
    genres: ["Superhero", "Action"],
    duration: "2h 30m",
    rating: 8.3,
    certificate: "U/A",
    releaseDate: "2026-08-22",
    description: "An explosive superhero spectacle following legendary heroes fighting for justice and survival.",
    cast: [
      { id: "c21", name: "David Corenswet", character: "Clark Kent", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
      { id: "c22", name: "Rachel Brosnahan", character: "Lois Lane", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" }
    ],
    crew: [
      { id: "cr23", name: "James Gunn", role: "Director" },
      { id: "cr24", name: "John Murphy", role: "Music" }
    ]
  },
  {
    id: "hushar-pittalu",
    title: "Hushar Pittalu",
    poster: "/posters/hushar-pittalu.jpg",
    backdrop: "/posters/hushar-pittalu.jpg",
    language: "Telugu",
    genres: ["Comedy", "Drama"],
    duration: "2h 18m",
    rating: 8.2,
    certificate: "U/A",
    releaseDate: "2026-08-18",
    description: "A hilarious youth comedy about a group of witty friends navigating chaotic situations and life goals.",
    cast: [
      { id: "c23", name: "Priyadarshi", character: "Rocky", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80" },
      { id: "c24", name: "Rahul Ramakrishna", character: "Bittu", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80" }
    ],
    crew: [
      { id: "cr25", name: "Anudeep KV", role: "Director" },
      { id: "cr26", name: "Radhan", role: "Music" }
    ]
  }
];
