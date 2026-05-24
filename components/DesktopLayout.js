import DesktopSidebar from './DesktopSidebar'

export default function DesktopLayout({ children }) {
  return (
    <div className="zh-desktop-shell">
      <DesktopSidebar />
      <div className="zd-main">
        <div className="zd-content">
          {children}
        </div>
      </div>
    </div>
  )
}
