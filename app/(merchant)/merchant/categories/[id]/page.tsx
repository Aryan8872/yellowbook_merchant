export default function CategoryPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Category {params.id}</h1>
    </div>
  )
}
