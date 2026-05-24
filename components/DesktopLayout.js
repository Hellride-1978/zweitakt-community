import DesktopSidebar from './DesktopSidebar'
import DesktopTopRow from './DesktopTopRow'

export default function DesktopLayout({ children, crumb }) {
  return (
    <div className="zh-desktop-shell">
      <DesktopSidebar />
      <div className="zd-main">
        <DesktopTopRow crumb={crumb} />
        <div className="zd-content">
          {children}
        </div>
      </div>
    </div>
  )
}
