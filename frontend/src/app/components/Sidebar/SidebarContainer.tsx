import Sidebar from "./Sidebar";
import Contact from "@/app/components/Contact/Contact";


export default function SidebarContainer() {
    return <Sidebar contact={<Contact />} />;
}