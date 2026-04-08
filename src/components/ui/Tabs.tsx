import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn("flex space-x-1 border-b border-gray-200 overflow-x-auto no-scrollbar", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative min-h-[44px] flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
              isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-lg"
            )}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
