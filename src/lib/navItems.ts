import { LayoutDashboard, ScanLine, Printer, Settings, Home } from 'lucide-react';

export const navItems = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/scan', label: 'Scan', icon: ScanLine },
  { path: '/homes', label: 'Homes', icon: Home },
  { path: '/print', label: 'Print', icon: Printer },
] as const;

export const settingsNavItem = { path: '/settings', label: 'Settings', icon: Settings } as const;
