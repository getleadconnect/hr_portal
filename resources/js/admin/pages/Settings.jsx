import { useState } from 'react';
import { Users, Briefcase, GraduationCap, Building, UserCog, Bell, CalendarDays, Percent } from 'lucide-react';
import UserSettings from './settings/UserSettings';
import JobCategorySettings from './settings/JobCategorySettings';
import QualificationsSettings from './settings/QualificationsSettings';
import DepartmentsSettings from './settings/DepartmentsSettings';
import DesignationsSettings from './settings/DesignationsSettings';
import NotificationsSettings from './settings/NotificationsSettings';
import LeaveSettings from './settings/LeaveSettings';
import AllowanceSettings from './settings/AllowanceSettings';

const tabs = [
    { id: 'user-settings', label: 'User Settings', icon: Users, component: UserSettings },
    { id: 'job-category', label: 'Job Category', icon: Briefcase, component: JobCategorySettings },
    { id: 'qualifications', label: 'Qualifications', icon: GraduationCap, component: QualificationsSettings },
    { id: 'departments', label: 'Departments', icon: Building, component: DepartmentsSettings },
    { id: 'designations', label: 'Designations', icon: UserCog, component: DesignationsSettings },
    { id: 'leave-settings', label: 'Leave Settings', icon: CalendarDays, component: LeaveSettings },
    { id: 'allowances', label: 'Allowances', icon: Percent, component: AllowanceSettings },
    { id: 'notifications', label: 'Notifications', icon: Bell, component: NotificationsSettings },
];

export default function Settings() {
    const [activeTab, setActiveTab] = useState('user-settings');

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || UserSettings;
    const activeTabData = tabs.find(tab => tab.id === activeTab);

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="px-2 sm:px-0">
                <h1 className="font-bold tracking-tight text-lg sm:text-xl">Settings</h1>
                <p className="text-muted-foreground text-sm sm:text-base">Manage system configuration and settings</p>
            </div>

            {/* Mobile: Horizontal Scrolling Tabs */}
            <div className="sm:hidden overflow-x-auto px-2">
                <div className="flex gap-2 min-w-max pb-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                                    ${isActive
                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                                    }
                                `}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Desktop: Sidebar + Content */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Desktop Sidebar */}
                <div className="hidden sm:block w-56 shrink-0">
                    <nav className="space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                                        ${isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }
                                    `}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 px-2 sm:px-0">
                    <ActiveComponent />
                </div>
            </div>
        </div>
    );
}
