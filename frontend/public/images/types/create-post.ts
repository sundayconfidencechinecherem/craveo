import { 
  FaPizzaSlice, 
  FaHamburger, 
  FaBreadSlice 
} from 'react-icons/fa';
import { GiRiceCooker, GiTacos, GiNoodles, GiBowlOfRice} from 'react-icons/gi';
import { MdIcecream } from 'react-icons/md';
import { TbLeaf } from 'react-icons/tb';
import { IconType } from 'react-icons';

export interface CreatePostFormData {
  image: File | null;
  caption: string;
  tags: string[];
  cuisine: string;
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  calories?: number;
  servings?: number;
  location?: string;
}

export interface CuisineOption {
  value: string;
  label: string;
  icon?: IconType; // Updated type
}

export const CUISINE_OPTIONS: CuisineOption[] = [
  { value: 'italian', label: 'Italian', icon: FaPizzaSlice },
  { value: 'japanese', label: 'Japanese', icon: GiRiceCooker },
  { value: 'mexican', label: 'Mexican', icon: GiTacos },
  { value: 'american', label: 'American', icon: FaHamburger },
  { value: 'chinese', label: 'Chinese', icon: GiNoodles },
  { value: 'indian', label: 'Indian', icon: GiBowlOfRice },
  { value: 'thai', label: 'Thai', icon: GiBowlOfRice },
  { value: 'mediterranean', label: 'Mediterranean', icon: TbLeaf },
  { value: 'french', label: 'French', icon: FaBreadSlice },
  { value: 'dessert', label: 'Dessert', icon: MdIcecream },
  { value: 'vegetarian', label: 'Vegetarian', icon: TbLeaf },
  { value: 'vegan', label: 'Vegan', icon: TbLeaf },
  { value: 'other', label: 'Other', icon: FaBreadSlice },
];

export const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard'] as const;

export const PREP_TIME_OPTIONS = [
  '15 mins',
  '30 mins',
  '45 mins',
  '1 hour',
  '1.5 hours',
  '2 hours',
  '2+ hours',
];
