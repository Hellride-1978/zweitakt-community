import Breadcrumb from './Breadcrumb'

export default function DesktopLayout({ children, crumb }) {
  return (
    <>
      <Breadcrumb crumb={crumb} />
      <div className="zd-inner">
        {children}
      </div>
    </>
  )
}
