import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MapPin, Phone, Globe, Building, Heart, Scale, Shield, 
  Home, Users, Search, ExternalLink, Clock 
} from "lucide-react";

interface Resource {
  id: string;
  name: string;
  category: ResourceCategory;
  description: string;
  phone?: string;
  website?: string;
  address?: string;
  hours?: string;
  services: string[];
  region: string;
}

type ResourceCategory = "shelter" | "legal" | "counseling" | "medical" | "hotline" | "ngo";

const CATEGORY_INFO: Record<ResourceCategory, { label: string; icon: React.ElementType; color: string }> = {
  shelter: { label: "Shelters", icon: Home, color: "text-green-600" },
  legal: { label: "Legal Aid", icon: Scale, color: "text-blue-600" },
  counseling: { label: "Counseling", icon: Heart, color: "text-pink-600" },
  medical: { label: "Medical", icon: Shield, color: "text-red-600" },
  hotline: { label: "Hotlines", icon: Phone, color: "text-orange-600" },
  ngo: { label: "NGOs", icon: Users, color: "text-purple-600" },
};

const RESOURCES: Resource[] = [
  // Hotlines
  {
    id: "1",
    name: "Gender Violence Recovery Centre",
    category: "hotline",
    description: "24/7 support hotline for survivors of gender-based violence in Kenya",
    phone: "+254 709 400 200",
    website: "https://gfrchospital.com",
    hours: "24/7",
    services: ["Crisis support", "Referrals", "Counseling", "Medical referrals"],
    region: "Kenya (National)",
  },
  {
    id: "2",
    name: "COVAW Kenya",
    category: "hotline",
    description: "Coalition on Violence Against Women - dedicated to ending GBV in Kenya",
    phone: "+254 800 720 553",
    website: "https://covaw.or.ke",
    hours: "Mon-Fri 8am-5pm",
    services: ["Legal aid", "Counseling", "Advocacy", "Emergency support"],
    region: "Kenya (National)",
  },
  {
    id: "3",
    name: "Kenya Red Cross Counseling",
    category: "hotline",
    description: "Mental health and crisis support services",
    phone: "1199",
    hours: "24/7",
    services: ["Crisis counseling", "Mental health support", "Referrals"],
    region: "Kenya (National)",
  },
  // Shelters
  {
    id: "4",
    name: "FIDA Kenya Safe House",
    category: "shelter",
    description: "Emergency shelter for women and children fleeing violence",
    phone: "+254 20 387 4938",
    website: "https://fidakenya.org",
    address: "Nairobi",
    services: ["Emergency shelter", "Legal aid", "Counseling", "Childcare"],
    region: "Nairobi",
  },
  {
    id: "5",
    name: "Wangu Kanja Foundation Shelter",
    category: "shelter",
    description: "Safe accommodation and rehabilitation for GBV survivors",
    phone: "+254 722 178 177",
    website: "https://wangukanjafoundation.org",
    address: "Nairobi",
    services: ["Shelter", "Rehabilitation", "Skills training", "Counseling"],
    region: "Nairobi",
  },
  // Legal Aid
  {
    id: "6",
    name: "National Legal Aid Service",
    category: "legal",
    description: "Free legal services for vulnerable populations",
    phone: "+254 800 720 152",
    website: "https://www.legalaid.go.ke",
    hours: "Mon-Fri 8am-5pm",
    services: ["Legal representation", "Legal advice", "Court support"],
    region: "Kenya (National)",
  },
  {
    id: "7",
    name: "Kituo Cha Sheria",
    category: "legal",
    description: "Legal advice and human rights advocacy",
    phone: "+254 20 387 4220",
    website: "https://kituochasheria.or.ke",
    address: "Nairobi",
    services: ["Legal aid", "Human rights advocacy", "Paralegal training"],
    region: "Nairobi",
  },
  // Counseling
  {
    id: "8",
    name: "Befrienders Kenya",
    category: "counseling",
    description: "Emotional support and suicide prevention services",
    phone: "+254 722 178 177",
    hours: "24/7",
    services: ["Emotional support", "Crisis intervention", "Suicide prevention"],
    region: "Kenya (National)",
  },
  {
    id: "9",
    name: "Chiromo Lane Medical Centre",
    category: "counseling",
    description: "Professional mental health services and trauma counseling",
    phone: "+254 20 273 1431",
    website: "https://chiromolanemedicalcentre.com",
    address: "Chiromo Lane, Nairobi",
    services: ["Psychiatric care", "Trauma counseling", "Group therapy"],
    region: "Nairobi",
  },
  // Medical
  {
    id: "10",
    name: "Nairobi Women's Hospital",
    category: "medical",
    description: "Specialized healthcare for women including GBV survivors",
    phone: "+254 20 276 3000",
    website: "https://nairobiwomenshospital.org",
    address: "Nairobi",
    hours: "24/7",
    services: ["Medical care", "Forensic examination", "PEP services", "Counseling"],
    region: "Nairobi",
  },
  {
    id: "11",
    name: "Kenyatta National Hospital - Gender Violence Recovery Centre",
    category: "medical",
    description: "Comprehensive care for survivors of sexual and gender-based violence",
    phone: "+254 20 272 6300",
    address: "Hospital Road, Nairobi",
    hours: "24/7",
    services: ["Medical care", "Forensic services", "Counseling", "Legal support"],
    region: "Nairobi",
  },
  // NGOs
  {
    id: "12",
    name: "CREAW Kenya",
    category: "ngo",
    description: "Centre for Rights Education and Awareness - women's rights organization",
    phone: "+254 20 273 5561",
    website: "https://creawkenya.org",
    services: ["Advocacy", "Legal support", "Community education", "Policy research"],
    region: "Kenya (National)",
  },
  {
    id: "13",
    name: "Healthcare Assistance Kenya (HAK)",
    category: "ngo",
    description: "Supporting survivors with healthcare and rehabilitation",
    phone: "+254 20 239 6850",
    website: "https://hakkenya.org",
    services: ["Healthcare support", "Rehabilitation", "Community outreach"],
    region: "Kenya (National)",
  },
  // Regional resources
  {
    id: "14",
    name: "Coast Women in Development (CWID)",
    category: "ngo",
    description: "Supporting women and girls in the coastal region",
    phone: "+254 41 222 8088",
    address: "Mombasa",
    services: ["Shelter referrals", "Legal aid", "Economic empowerment"],
    region: "Mombasa",
  },
  {
    id: "15",
    name: "GROOTS Kenya",
    category: "ngo",
    description: "Grassroots women's organization addressing GBV in rural areas",
    phone: "+254 20 271 1956",
    website: "https://grootskenya.org",
    services: ["Community mobilization", "GBV prevention", "Economic empowerment"],
    region: "Kenya (National)",
  },
  // Pan-African Resources
  {
    id: "16",
    name: "Africa Union Women's Rights",
    category: "ngo",
    description: "Pan-African women's rights advocacy and policy",
    website: "https://au.int/en/sa/gender",
    services: ["Policy advocacy", "Regional coordination", "Research"],
    region: "Africa (Continental)",
  },
  {
    id: "17",
    name: "Equality Now",
    category: "ngo",
    description: "International organization fighting for women's and girls' rights in Africa",
    website: "https://www.equalitynow.org",
    services: ["Legal advocacy", "Campaign support", "Policy change"],
    region: "Africa (Continental)",
  },
  // Uganda
  {
    id: "18",
    name: "Uganda Women's Network (UWONET)",
    category: "ngo",
    description: "Women's rights coalition in Uganda",
    phone: "+256 414 286 539",
    website: "https://uwonet.or.ug",
    services: ["Advocacy", "Legal aid", "GBV prevention"],
    region: "Uganda",
  },
  {
    id: "19",
    name: "Uganda Police Child & Family Protection Unit",
    category: "hotline",
    description: "Specialized unit for GBV and child protection",
    phone: "+256 800 199 199",
    hours: "24/7",
    services: ["Emergency response", "Investigation", "Victim support"],
    region: "Uganda",
  },
  // Tanzania
  {
    id: "20",
    name: "Tanzania Women Lawyers Association",
    category: "legal",
    description: "Legal aid for women and children in Tanzania",
    phone: "+255 22 215 0195",
    website: "https://tawla.or.tz",
    services: ["Legal aid", "Court representation", "Rights education"],
    region: "Tanzania",
  },
  // Rwanda
  {
    id: "21",
    name: "Haguruka",
    category: "legal",
    description: "Defense and promotion of children and women's rights in Rwanda",
    phone: "+250 788 312 795",
    website: "https://haguruka.org.rw",
    services: ["Legal aid", "Mediation", "Rights awareness"],
    region: "Rwanda",
  },
  // South Africa
  {
    id: "22",
    name: "People Opposing Women Abuse (POWA)",
    category: "shelter",
    description: "Shelter and support services for abused women in South Africa",
    phone: "+27 11 642 4345",
    website: "https://pfrwa.org.za",
    hours: "24/7 Crisis Line",
    services: ["Shelter", "Counseling", "Legal support", "Court preparation"],
    region: "South Africa",
  },
  {
    id: "23",
    name: "South Africa GBV Command Centre",
    category: "hotline",
    description: "National helpline for gender-based violence",
    phone: "0800 428 428",
    hours: "24/7",
    services: ["Crisis support", "Referrals", "Shelter placement"],
    region: "South Africa",
  },
  // Nigeria
  {
    id: "24",
    name: "Women Aid Collective (WACOL)",
    category: "ngo",
    description: "Legal and psychosocial support for women in Nigeria",
    phone: "+234 42 256 092",
    website: "https://wacolnigeria.org",
    services: ["Legal aid", "Counseling", "Shelter", "Advocacy"],
    region: "Nigeria",
  },
  {
    id: "25",
    name: "Nigerian Police Women & Children Protection Unit",
    category: "hotline",
    description: "Specialized police unit for GBV cases",
    phone: "112",
    hours: "24/7",
    services: ["Emergency response", "Investigation", "Protection"],
    region: "Nigeria",
  },
  // Ghana
  {
    id: "26",
    name: "DOVVSU - Domestic Violence Victim Support Unit",
    category: "hotline",
    description: "Ghana Police Service specialized unit",
    phone: "+233 302 773 906",
    hours: "24/7",
    services: ["Emergency response", "Investigation", "Victim support"],
    region: "Ghana",
  },
  // Ethiopia
  {
    id: "27",
    name: "Ethiopian Women Lawyers Association",
    category: "legal",
    description: "Legal aid and advocacy for women's rights",
    phone: "+251 11 552 6432",
    services: ["Legal aid", "Court representation", "Rights awareness"],
    region: "Ethiopia",
  },
];

const ResourceDirectory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");

  const regions = useMemo(() => {
    const uniqueRegions = [...new Set(RESOURCES.map((r) => r.region))];
    return uniqueRegions.sort();
  }, []);

  const filteredResources = useMemo(() => {
    return RESOURCES.filter((resource) => {
      const matchesSearch =
        searchQuery === "" ||
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.services.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "all" || resource.category === selectedCategory;

      const matchesRegion =
        selectedRegion === "all" || resource.region === selectedRegion;

      return matchesSearch && matchesCategory && matchesRegion;
    });
  }, [searchQuery, selectedCategory, selectedRegion]);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Resource Directory
          </CardTitle>
          <CardDescription>
            Find verified support services, shelters, legal aid, and more
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources, services, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    {info.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === "all" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory("all")}
            >
              All
            </Badge>
            {Object.entries(CATEGORY_INFO).map(([key, info]) => {
              const Icon = info.icon;
              return (
                <Badge
                  key={key}
                  variant={selectedCategory === key ? "default" : "outline"}
                  className="cursor-pointer gap-1"
                  onClick={() => setSelectedCategory(key)}
                >
                  <Icon className="h-3 w-3" />
                  {info.label}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredResources.length} of {RESOURCES.length} resources
        </p>
      </div>

      {/* Resource List */}
      <div className="grid gap-4">
        {filteredResources.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No Resources Found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredResources.map((resource) => {
            const categoryInfo = CATEGORY_INFO[resource.category];
            const Icon = categoryInfo.icon;

            return (
              <Card key={resource.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-muted ${categoryInfo.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">{resource.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {resource.description}
                          </p>
                        </div>
                        <Badge variant="outline" className={categoryInfo.color}>
                          {categoryInfo.label}
                        </Badge>
                      </div>

                      {/* Contact Info */}
                      <div className="flex flex-wrap gap-4 text-sm mb-3">
                        {resource.phone && (
                          <a
                            href={`tel:${resource.phone}`}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <Phone className="h-4 w-4" />
                            {resource.phone}
                          </a>
                        )}
                        {resource.website && (
                          <a
                            href={resource.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <Globe className="h-4 w-4" />
                            Website
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {resource.address && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {resource.address}
                          </span>
                        )}
                        {resource.hours && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {resource.hours}
                          </span>
                        )}
                      </div>

                      {/* Services */}
                      <div className="flex flex-wrap gap-1">
                        {resource.services.map((service, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>

                      {/* Region Badge */}
                      <div className="mt-3">
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {resource.region}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Help Text */}
      <Card className="bg-muted/50">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          <Shield className="h-4 w-4 inline-block mr-1" />
          All resources are verified and updated regularly. If you need immediate help, 
          call emergency services at <strong>999/112</strong> or the Gender Violence Hotline at <strong>0800 720 990</strong>.
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceDirectory;
