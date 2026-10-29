export type FeaturedProperty = {
  id: string;
  title: string;
  locality: string;
  price: string;
  area: string;
  tag: string;
};

export const FEATURED_PROPERTIES: FeaturedProperty[] = [
  {
    id: "dummy-1",
    title: "3 BHK Apartment",
    locality: "Bopal, Ahmedabad",
    price: "₹85 Lac",
    area: "1,450 sq ft",
    tag: "Ready to Move",
  },
  {
    id: "dummy-2",
    title: "4 BHK Penthouse",
    locality: "South Bopal, Ahmedabad",
    price: "₹2.4 Cr",
    area: "5,500 sq ft",
    tag: "Premium",
  },
  {
    id: "dummy-3",
    title: "2 BHK Builder Floor",
    locality: "Thaltej, Ahmedabad",
    price: "₹62 Lac",
    area: "1,100 sq ft",
    tag: "New Listing",
  },
  {
    id: "dummy-4",
    title: "4 BHK Villa",
    locality: "Hathijan, Ahmedabad",
    price: "₹1.8 Cr",
    area: "3,200 sq ft",
    tag: "Verified",
  },
];
