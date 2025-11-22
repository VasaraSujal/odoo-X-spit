// import {
//   LayoutDashboard,
//   Package,
//   FileText,
//   ArrowDownToLine,
//   ArrowUpFromLine,
//   ArrowLeftRight,
//   Settings as SettingsIcon,
//   Warehouse,
//   History,
//   Sliders,
//   User,
//   ChevronDown,
// } from "lucide-react";
// import { NavLink } from "@/components/NavLink";
// import { useLocation } from "react-router-dom";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   useSidebar,
// } from "@/components/ui/sidebar";
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "@/components/ui/collapsible";

// const mainNavItems = [
//   { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
//   { title: "Products", url: "/products", icon: Package },
// ];

// const operationsItems = [
//   { title: "Receipts", url: "/operations/receipts", icon: ArrowDownToLine },
//   { title: "Delivery Orders", url: "/operations/deliveries", icon: ArrowUpFromLine },
//   { title: "Internal Transfers", url: "/operations/transfers", icon: ArrowLeftRight },
//   { title: "Stock Adjustments", url: "/operations/adjustments", icon: Sliders },
//   { title: "Move History", url: "/operations/move-history", icon: History },
// ];

// const settingsItems = [
//   { title: "Warehouses", url: "/settings/warehouses", icon: Warehouse },
// ];

// export function AppSidebar() {
//   const { state } = useSidebar();
//   const location = useLocation();
//   const collapsed = state === "collapsed";

//   const isOperationsActive = operationsItems.some((item) =>
//     location.pathname.startsWith(item.url)
//   );

//   return (
//     <Sidebar collapsible="icon" className="border-r">
//       <SidebarContent>
//         {/* Brand */}
//         <div className="flex h-16 items-center border-b px-6">
//           {!collapsed && (
//             <h1 className="text-xl font-bold text-sidebar-foreground">
//               StockMaster
//             </h1>
//           )}
//           {collapsed && (
//             <span className="text-lg font-bold text-sidebar-foreground">SM</span>
//           )}
//         </div>

//         {/* Main Navigation */}
//         <SidebarGroup>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {mainNavItems.map((item) => (
//                 <SidebarMenuItem key={item.title}>
//                   <SidebarMenuButton asChild>
//                     <NavLink
//                       to={item.url}
//                       className="flex items-center gap-3"
//                       activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
//                     >
//                       <item.icon className="h-4 w-4" />
//                       {!collapsed && <span>{item.title}</span>}
//                     </NavLink>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>

//         {/* Operations */}
//         <SidebarGroup>
//           <Collapsible defaultOpen={isOperationsActive} className="group/collapsible">
//             <SidebarGroupLabel asChild>
//               <CollapsibleTrigger className="flex w-full items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <FileText className="h-4 w-4" />
//                   {!collapsed && <span>Operations</span>}
//                 </div>
//                 {!collapsed && (
//                   <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
//                 )}
//               </CollapsibleTrigger>
//             </SidebarGroupLabel>
//             <CollapsibleContent>
//               <SidebarGroupContent>
//                 <SidebarMenu>
//                   {operationsItems.map((item) => (
//                     <SidebarMenuItem key={item.title}>
//                       <SidebarMenuButton asChild>
//                         <NavLink
//                           to={item.url}
//                           className="flex items-center gap-3"
//                           activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
//                         >
//                           <item.icon className="h-4 w-4" />
//                           {!collapsed && <span>{item.title}</span>}
//                         </NavLink>
//                       </SidebarMenuButton>
//                     </SidebarMenuItem>
//                   ))}
//                 </SidebarMenu>
//               </SidebarGroupContent>
//             </CollapsibleContent>
//           </Collapsible>
//         </SidebarGroup>

//         {/* Settings */}
//         <SidebarGroup>
//           <SidebarGroupLabel>
//             <div className="flex items-center gap-2">
//               <SettingsIcon className="h-4 w-4" />
//               {!collapsed && <span>Settings</span>}
//             </div>
//           </SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {settingsItems.map((item) => (
//                 <SidebarMenuItem key={item.title}>
//                   <SidebarMenuButton asChild>
//                     <NavLink
//                       to={item.url}
//                       className="flex items-center gap-3"
//                       activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
//                     >
//                       <item.icon className="h-4 w-4" />
//                       {!collapsed && <span>{item.title}</span>}
//                     </NavLink>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>

//         {/* Profile */}
//         <SidebarGroup>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               <SidebarMenuItem>
//                 <SidebarMenuButton asChild>
//                   <NavLink
//                     to="/profile"
//                     className="flex items-center gap-3"
//                     activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
//                   >
//                     <User className="h-4 w-4" />
//                     {!collapsed && <span>Profile</span>}
//                   </NavLink>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>
//     </Sidebar>
//   );
// }




import {
  LayoutDashboard,
  Package,
  FileText,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Settings as SettingsIcon,
  Warehouse,
  History,
  Sliders,
  User,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Products", url: "/products", icon: Package },
];

const operationsItems = [
  { title: "Receipts", url: "/operations/receipts", icon: ArrowDownToLine },
  { title: "Delivery Orders", url: "/operations/deliveries", icon: ArrowUpFromLine },
  { title: "Internal Transfers", url: "/operations/transfers", icon: ArrowLeftRight },
  { title: "Stock Adjustments", url: "/operations/adjustments", icon: Sliders },
  { title: "Move History", url: "/operations/move-history", icon: History },
];

const settingsItems = [
  { title: "Warehouses", url: "/settings/warehouses", icon: Warehouse },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";
  const [operationsOpen, setOperationsOpen] = useState(true);

  const isOperationsActive = operationsItems.some((item) =>
    location.pathname.startsWith(item.url)
  );

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r-2 border-slate-200 bg-white"
    >
      <SidebarContent className="bg-white">
        {/* Brand Header */}
        <div className={`flex h-20 items-center border-b-2 border-slate-200 bg-white transition-all duration-300 ${
          collapsed ? "justify-center px-4" : "px-6"
        }`}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h1 className="text-xl font-black text-black tracking-tight">
                  StockMaster
                </h1>
                <p className="text-xs text-slate-400 font-medium">Inventory System</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-lg font-black text-slate-900">SM</span>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="py-4">
          {!collapsed && (
            <SidebarGroupLabel className="px-6 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Main Menu
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-3">
              {mainNavItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-slate-900 text-white shadow-lg"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        } ${collapsed ? "justify-center" : ""}`}
                      >
                        <item.icon className={`h-5 w-5 flex-shrink-0 ${
                          isActive ? "text-white" : "text-slate-600"
                        }`} />
                        {!collapsed && (
                          <span className="font-semibold text-sm whitespace-nowrap">
                            {item.title}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Operations Section */}
        <SidebarGroup className="py-4">
          <Collapsible 
            open={operationsOpen || collapsed} 
            onOpenChange={setOperationsOpen}
            className="group/collapsible"
          >
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger 
                className={`flex w-full items-center justify-between px-6 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors ${
                  collapsed ? "justify-center px-3" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span className="whitespace-nowrap">Operations</span>}
                </div>
                {!collapsed && (
                  <ChevronDown className={`ml-auto h-4 w-4 transition-transform duration-200 ${
                    operationsOpen ? "rotate-180" : ""
                  }`} />
                )}
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent className="transition-all duration-300">
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1 px-3 mt-2">
                  {operationsItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                              isActive
                                ? "bg-slate-900 text-white shadow-lg"
                                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                            } ${collapsed ? "justify-center" : ""}`}
                          >
                            <item.icon className={`h-4 w-4 flex-shrink-0 ${
                              isActive ? "text-white" : "text-slate-600"
                            }`} />
                            {!collapsed && (
                              <span className="font-medium text-sm whitespace-nowrap">
                                {item.title}
                              </span>
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Settings Section */}
        <SidebarGroup className="py-4">
          {!collapsed && (
            <SidebarGroupLabel className="px-6 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Settings
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-3">
              {settingsItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-slate-900 text-white shadow-lg"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        } ${collapsed ? "justify-center" : ""}`}
                      >
                        <item.icon className={`h-4 w-4 flex-shrink-0 ${
                          isActive ? "text-white" : "text-slate-600"
                        }`} />
                        {!collapsed && (
                          <span className="font-medium text-sm whitespace-nowrap">
                            {item.title}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Spacer to push profile to bottom */}
        <div className="flex-1" />

        {/* Profile Section - Fixed at Bottom */}
        <SidebarGroup className="py-4 border-t-2 border-slate-200">
          <SidebarGroupContent>
            <SidebarMenu className="px-3">
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/profile"
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                      location.pathname === "/profile"
                        ? "bg-slate-900 text-white shadow-lg"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      location.pathname === "/profile"
                        ? "bg-white"
                        : "bg-slate-200"
                    }`}>
                      <User className={`h-4 w-4 ${
                        location.pathname === "/profile"
                          ? "text-slate-900"
                          : "text-slate-600"
                      }`} />
                    </div>
                    {!collapsed && (
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">Profile</p>
                        <p className="text-xs text-slate-500 truncate">View settings</p>
                      </div>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}