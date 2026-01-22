import { Milk, Cookie, Ban, Beef, Carrot, Coffee, Wheat, Droplet, LucideIceCream, Egg, Drumstick } from 'lucide-react';

export const CATALOG = [
    {
        id: 'milk',
        name: 'Taza Milk',
        price: 60,
        unit: '1L',
        category: 'Dairy & Eggs',
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=400",
        icon: Milk
    },
    {
        id: 'bread',
        name: 'Whole Wheat Bread',
        price: 40,
        unit: '1pkt',
        category: 'Bakery',
        image: "https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&q=80&w=400",
        icon: Wheat
    },
    {
        id: 'eggs',
        name: 'Farm Eggs (6pcs)',
        price: 45,
        unit: '1pkt',
        category: 'Dairy & Eggs',
        image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=400",
        icon: Egg
    },
    {
        id: 'butter',
        name: 'Amul Butter',
        price: 58,
        unit: '100g',
        category: 'Dairy & Eggs',
        image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=400",
        icon: LucideIceCream
    },
    {
        id: 'onion',
        name: 'Red Onion',
        price: 30,
        unit: '1kg',
        category: 'Vegetables',
        image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=400",
        icon: Carrot
    },
    {
        id: 'potato',
        name: 'Fresh Potato',
        price: 25,
        unit: '1kg',
        category: 'Vegetables',
        image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&q=80&w=400",
        icon: Carrot
    },
    {
        id: 'tomato',
        name: 'Hybrid Tomato',
        price: 40,
        unit: '1kg',
        category: 'Vegetables',
        image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400",
        icon: Carrot
    },
    {
        id: 'chips',
        name: 'Potato Chips',
        price: 20,
        unit: '1pkt',
        category: 'Snacks',
        image: "https://images.unsplash.com/photo-1621447504864-d8497e0e59cf?auto=format&fit=crop&q=80&w=400",
        icon: Cookie
    },
    {
        id: 'chocolate',
        name: 'Dairy Milk',
        price: 50,
        unit: '1bar',
        category: 'Snacks',
        image: "https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&q=80&w=400",
        icon: Cookie
    },
    {
        id: 'coke',
        name: 'Coca Cola',
        price: 40,
        unit: '750ml',
        category: 'Beverages',
        image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400",
        icon: Coffee
    },
    {
        id: 'atta',
        name: 'Chakki Atta',
        price: 45,
        unit: '1kg',
        category: 'Staples',
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400",
        icon: Wheat
    },
    {
        id: 'rice',
        name: 'Basmati Rice',
        price: 120,
        unit: '1kg',
        category: 'Staples',
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400",
        icon: Wheat
    },
];

export const CATEGORIES = ['All', 'Dairy & Eggs', 'Vegetables', 'Snacks', 'Beverages', 'Staples'];
