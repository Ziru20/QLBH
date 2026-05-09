import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/store/useStore";
import { formatVND } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "@/store/types";

export const Route = createFileRoute("/admin/products")({ component: ProductsAdmin });

const empty = { name: "", slug: "", categoryId: "", price: 0, oldPrice: 0, stock: 0, image: "", description: "" };

function ProductsAdmin() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(empty);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, slug: p.slug, categoryId: p.categoryId, price: p.price, oldPrice: p.oldPrice ?? 0, stock: p.stock, image: p.image, description: p.description });
    setOpen(true);
  };
  const save = () => {
    if (!form.name || !form.categoryId || !form.price) { toast.error("Vui lòng điền đủ thông tin"); return; }
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, "-");
    const image = form.image || "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=70";
    const data = { ...form, slug, image, oldPrice: form.oldPrice || undefined };
    if (editing) { updateProduct(editing.id, data); toast.success("Đã cập nhật"); }
    else { addProduct(data); toast.success("Đã thêm"); }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-display text-3xl font-bold">Sản phẩm</h1><p className="text-muted-foreground">Tổng {products.length} sản phẩm</p></div>
        <div className="flex gap-2">
          <Input placeholder="Tìm sản phẩm..." value={q} onChange={(e) => setQ(e.target.value)} className="w-64" />
          <Button onClick={openNew}><Plus className="mr-1 h-4 w-4" />Thêm</Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Sản phẩm</th><th>Danh mục</th><th>Giá</th><th>Tồn kho</th><th className="text-right pr-4">Thao tác</th></tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt="" className="h-10 w-10 rounded object-cover" onError={(e) => { const t = e.currentTarget as HTMLImageElement; t.onerror = null; t.src = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Inter, Arial, sans-serif" font-size="10">Ảnh</text></svg>')}`; }} />
                    <div className="font-medium">{p.name}</div>
                  </div>
                </td>
                <td className="text-muted-foreground">{categories.find((c) => c.id === p.categoryId)?.name}</td>
                <td className="font-semibold">{formatVND(p.price)}</td>
                <td><span className={p.stock < 10 ? "text-destructive font-semibold" : ""}>{p.stock}</span></td>
                <td className="pr-4 text-right">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => { if (confirm("Xoá sản phẩm?")) { deleteProduct(p.id); toast.success("Đã xoá"); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Sửa" : "Thêm"} sản phẩm</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Tên</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
            <div><Label>Danh mục</Label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="h-10 w-full rounded-md border bg-background px-3">
                <option value="">-- Chọn --</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><Label>Giá</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} /></div>
            <div><Label>Giá gốc</Label><Input type="number" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: +e.target.value })} /></div>
            <div><Label>Tồn kho</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Ảnh URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Mô tả</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Huỷ</Button><Button onClick={save}>Lưu</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
