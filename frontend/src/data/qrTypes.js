import {
  Globe, FileText, ImageIcon, UserSquare, Video, AlignJustify,
  Smile, Music, Building2, Ticket, Smartphone, Monitor,
  Type, Mail, MessageSquare, Wifi,
} from 'lucide-react';

export const dynamicTypes = [
  { name: 'Website', desc: 'Open a URL', icon: Globe, color: '#3b82f6' },
  { name: 'PDF', desc: 'Show a PDF file', icon: FileText, color: '#ef4444' },
  { name: 'Images', desc: 'Display an image gallery', icon: ImageIcon, color: '#6366f1' },
  { name: 'vCard Plus', desc: 'Share contact details', icon: UserSquare, color: '#10b981' },
  { name: 'Video', desc: 'Show a video', icon: Video, color: '#f43f5e' },
  { name: 'List of links', desc: 'Group multiple links', icon: AlignJustify, color: '#d946ef' },
  { name: 'Social Media', desc: 'Share social profiles', icon: Smile, color: '#0ea5e9' },
  { name: 'MP3', desc: 'Play an audio file', icon: Music, color: '#f59e0b' },
  { name: 'Business', desc: 'Business information', icon: Building2, color: '#3b82f6' },
  { name: 'Coupon', desc: 'Share a discount coupon', icon: Ticket, color: '#f97316' },
  { name: 'Apps', desc: 'Redirect to app stores', icon: Smartphone, color: '#14b8a6' },
  { name: 'Landing page', desc: 'Create a custom page', icon: Monitor, color: '#f97316' },
];

export const staticTypes = [
  { name: 'Text', desc: 'Display plain text', icon: Type, color: '#3b82f6' },
  { name: 'Email', desc: 'Compose an email', icon: Mail, color: '#3b82f6' },
  { name: 'SMS', desc: 'Send a text message', icon: MessageSquare, color: '#22c55e' },
  { name: 'Wi-Fi', desc: 'Connect to a network', icon: Wifi, color: '#3b82f6' },
];
