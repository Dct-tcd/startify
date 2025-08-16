export default function Card({ title, subtitle, icon, onClick, to, LinkComp }) {
  const content = (
    <div className="card hover:shadow-lg transition-shadow cursor-pointer h-full">
      <div className="card-body flex items-start gap-4">
        <div className="rounded-xl bg-gray-700 text-sky-400 p-3">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-100">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  if (LinkComp && to) return <LinkComp to={to}>{content}</LinkComp>;
  return <div onClick={onClick}>{content}</div>;
}
