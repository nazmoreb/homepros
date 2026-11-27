export type Choice = {
  value: string;
  label: string;
};

export type ProjectField = {
  name: string;
  label: string;
  hint?: string;
  options: Choice[];
};

export type Category = {
  id: string;
  slug: string;
  label: string;
  blurb: string;
  landingLead: string;
  bullets: string[];
  fields: ProjectField[];
};

const stories: Choice[] = [
  { value: "1", label: "1 story" },
  { value: "2", label: "2 stories" },
  { value: "3_plus", label: "3 or more stories" },
];

export const categories: Category[] = [
  {
    id: "ROOFING",
    slug: "roofing",
    label: "Roofing",
    blurb:
      "Shingle or metal. HomePros introduces you to at most three roofers who work in your ZIP.",
    landingLead:
      "Tell us whether the roof is shingle or metal, and what you need done. We name the matching roofers before anyone is allowed to call.",
    bullets: [
      "Asphalt shingle or metal, chosen by you",
      "Replacement, leak repair, storm damage, or an inspection",
      "Shared with at most three roofers in your ZIP",
    ],
    fields: [
      {
        name: "subtype",
        label: "What kind of roof is it?",
        hint: "These are the two launch options.",
        options: [
          { value: "shingle", label: "Asphalt shingle" },
          { value: "metal", label: "Metal" },
        ],
      },
      {
        name: "need",
        label: "What do you need?",
        options: [
          { value: "replacement", label: "Full replacement" },
          { value: "repair", label: "Repair a leak" },
          { value: "storm", label: "Storm damage" },
          { value: "inspection", label: "Inspection" },
        ],
      },
      {
        name: "stories",
        label: "How many stories is the home?",
        options: stories,
      },
    ],
  },
  {
    id: "HVAC",
    slug: "hvac",
    label: "HVAC",
    blurb:
      "Repair, replacement, or a new system, matched with local HVAC companies rather than a call center.",
    landingLead:
      "Describe the system and the timing. You will see the company names, and you agree to each one before we share your number.",
    bullets: [
      "Repair, replace, new install, or maintenance",
      "Central air, furnace, heat pump, or mini-split",
      "At most three HVAC companies in your ZIP",
    ],
    fields: [
      {
        name: "service",
        label: "What kind of help do you need?",
        options: [
          { value: "repair", label: "Repair" },
          { value: "replace", label: "Replace the system" },
          { value: "install", label: "New installation" },
          { value: "maintenance", label: "Maintenance" },
        ],
      },
      {
        name: "system",
        label: "What system is this about?",
        options: [
          { value: "central_ac", label: "Central air" },
          { value: "furnace", label: "Furnace" },
          { value: "heat_pump", label: "Heat pump" },
          { value: "mini_split", label: "Mini-split" },
          { value: "not_sure", label: "Not sure" },
        ],
      },
      {
        name: "homeSize",
        label: "About how big is the home?",
        options: [
          { value: "under_1500", label: "Under 1,500 sq ft" },
          { value: "1500_2500", label: "1,500 to 2,500 sq ft" },
          { value: "2500_plus", label: "Over 2,500 sq ft" },
          { value: "not_sure", label: "Not sure" },
        ],
      },
    ],
  },
  {
    id: "WINDOWS",
    slug: "windows",
    label: "Windows",
    blurb:
      "A few windows or the whole house. You approve the companies by name before anyone contacts you.",
    landingLead:
      "Share how many windows and why you are replacing them. We only introduce window companies that cover your ZIP.",
    bullets: [
      "One window or the whole house",
      "Vinyl, wood, or fiberglass",
      "Named companies, capped at three",
    ],
    fields: [
      {
        name: "count",
        label: "How many windows?",
        options: [
          { value: "1_3", label: "1 to 3" },
          { value: "4_8", label: "4 to 8" },
          { value: "9_15", label: "9 to 15" },
          { value: "16_plus", label: "16 or more" },
        ],
      },
      {
        name: "material",
        label: "Any material preference?",
        options: [
          { value: "vinyl", label: "Vinyl" },
          { value: "wood", label: "Wood" },
          { value: "fiberglass", label: "Fiberglass" },
          { value: "not_sure", label: "Not sure" },
        ],
      },
      {
        name: "reason",
        label: "What is prompting the project?",
        options: [
          { value: "efficiency", label: "Energy efficiency" },
          { value: "broken", label: "Broken or failed windows" },
          { value: "remodel", label: "Remodel" },
          { value: "noise", label: "Noise" },
        ],
      },
    ],
  },
  {
    id: "SIDING",
    slug: "siding",
    label: "Siding",
    blurb:
      "Part of the house or all of it. HomePros shares the request with at most three siding pros.",
    landingLead:
      "Pick a material and whether you need a section or the whole home. If we cannot cover your ZIP, we say so.",
    bullets: [
      "Vinyl, fiber cement, wood, or metal",
      "A section or the whole home",
      "No out-of-area fillers",
    ],
    fields: [
      {
        name: "material",
        label: "What siding are you considering?",
        options: [
          { value: "vinyl", label: "Vinyl" },
          { value: "fiber_cement", label: "Fiber cement" },
          { value: "wood", label: "Wood" },
          { value: "metal", label: "Metal" },
          { value: "not_sure", label: "Not sure" },
        ],
      },
      {
        name: "scope",
        label: "How much of the home?",
        options: [
          { value: "part", label: "Part of the home" },
          { value: "whole_home", label: "The whole home" },
        ],
      },
      {
        name: "stories",
        label: "How many stories is the home?",
        options: stories,
      },
    ],
  },
  {
    id: "GUTTERS",
    slug: "gutters",
    label: "Gutters",
    blurb:
      "New gutters, repairs, or gutter guards. The companies who may call are named before you submit.",
    landingLead:
      "Include gutter guards if you want them. We match gutter companies that serve your ZIP, and we stop at three.",
    bullets: [
      "Install, replace, repair, or gutter guards",
      "Guards can be part of a new gutter job",
      "At most three gutter companies",
    ],
    fields: [
      {
        name: "service",
        label: "What do you need?",
        options: [
          { value: "install", label: "New gutters" },
          { value: "replace", label: "Replace gutters" },
          { value: "repair", label: "Repair" },
          { value: "guards", label: "Gutter guards" },
        ],
      },
      {
        name: "guards",
        label: "Do you want gutter guards?",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "not_sure", label: "Not sure" },
        ],
      },
      {
        name: "stories",
        label: "How many stories is the home?",
        options: stories,
      },
    ],
  },
  {
    id: "FLOORING",
    slug: "flooring",
    label: "Flooring",
    blurb:
      "Hardwood, vinyl, tile, or carpet. Local flooring pros, capped at three introductions.",
    landingLead:
      "Tell us the material and roughly how much floor. You will see the flooring companies by name before we share your request.",
    bullets: [
      "Hardwood, luxury vinyl, tile, carpet, or laminate",
      "One room or the whole home",
      "Contact info comes last, after the project details",
    ],
    fields: [
      {
        name: "material",
        label: "What flooring do you want?",
        options: [
          { value: "hardwood", label: "Hardwood" },
          { value: "lvp", label: "Luxury vinyl plank" },
          { value: "tile", label: "Tile" },
          { value: "carpet", label: "Carpet" },
          { value: "laminate", label: "Laminate" },
        ],
      },
      {
        name: "rooms",
        label: "How much of the home?",
        options: [
          { value: "one", label: "One room" },
          { value: "several", label: "Several rooms" },
          { value: "whole_home", label: "The whole home" },
        ],
      },
      {
        name: "sqft",
        label: "About how many square feet?",
        options: [
          { value: "under_300", label: "Under 300" },
          { value: "300_800", label: "300 to 800" },
          { value: "800_1500", label: "800 to 1,500" },
          { value: "1500_plus", label: "Over 1,500" },
          { value: "not_sure", label: "Not sure" },
        ],
      },
    ],
  },
];

export const timelines: Choice[] = [
  { value: "asap", label: "As soon as possible" },
  { value: "two_weeks", label: "Within two weeks" },
  { value: "one_to_three_months", label: "In 1 to 3 months" },
  { value: "researching", label: "I am researching" },
];

export const homeownerStatuses: Choice[] = [
  { value: "owner_occupied", label: "I own it and live there" },
  { value: "owner_rental", label: "I own it and rent it out" },
  { value: "renter", label: "I rent" },
  { value: "authorized", label: "I am authorized to request work for the owner" },
];

export const contractorStatuses = ["PENDING", "VETTED", "APPROVED", "SUSPENDED"] as const;
export type ContractorStatus = (typeof contractorStatuses)[number];

export function getCategoryById(id: string): Category | undefined {
  const key = id.trim().toUpperCase();
  return categories.find((category) => category.id === key);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  const key = slug.trim().toLowerCase();
  return categories.find((category) => category.slug === key);
}

export function resolveCategory(value: string): Category | undefined {
  return getCategoryById(value) ?? getCategoryBySlug(value);
}

export function choiceLabel(options: Choice[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function exampleProjectDetails(categoryId: string): Record<string, string> {
  const category = getCategoryById(categoryId);
  if (!category) return {};
  return Object.fromEntries(
    category.fields.map((field) => [field.name, field.options[0]?.value ?? ""]),
  );
}
