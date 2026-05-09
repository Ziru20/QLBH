import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Category } from "@/store/types";

export const Route = createFileRoute("/admin/categories")({ component: CategoriesPage });

function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });

  const openNew = () => { setEditing(null); setForm({ name: "", slug: "", description: "" }); setOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, slug: c.slug, description: c.description ?? "" }); setOpen(true); };
  const save = () => {
    if (!form.name) { toast.error("Tên không được trống"); return; }
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, "-");
    if (editing) { updateCategory(editing.id, { ...form, slug }); toast.success("Đã cập nhật"); }
    else { addCategory({ ...form, slug }); toast.success("Đã thêm"); }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-3xl font-bold">Danh mục sản phẩm</h1><p className="text-muted-foreground">Tổng {categories.length} danh mục</p></div>
        <Button onClick={openNew}><Plus className="mr-1 h-4 w-4" />Thêm danh mục</Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Tên</th><th>Slug</th><th>Mô tả</th><th className="text-right pr-4">Thao tác</th></tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="font-mono text-xs text-muted-foreground">{c.slug}</td>
                <td className="text-muted-foreground">{c.description}</td>
                <td className="pr-4 text-right">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => { if (confirm("Xoá danh mục?")) { deleteCategory(c.id); toast.success("Đã xoá"); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Sửa" : "Thêm"} danh mục</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Tên</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" /></div>
            <div><Label>Mô tả</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Huỷ</Button><Button onClick={save}>Lưu</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
