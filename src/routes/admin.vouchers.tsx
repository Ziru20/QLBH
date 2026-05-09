import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/store/useStore";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Voucher } from "@/store/types";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/vouchers")({ component: VouchersAdmin });

const empty = { code: "", description: "", type: "percent" as "percent" | "fixed", value: 10, minOrder: 0, expiresAt: "2026-12-31", active: true };

function VouchersAdmin() {
  const { vouchers, addVoucher, updateVoucher, deleteVoucher } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [form, setForm] = useState(empty);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (v: Voucher) => { setEditing(v); setForm({ code: v.code, description: v.description, type: v.type, value: v.value, minOrder: v.minOrder, expiresAt: v.expiresAt, active: v.active }); setOpen(true); };
  const save = () => {
    if (!form.code) { toast.error("Thiếu mã"); return; }
    if (editing) { updateVoucher(editing.id, form); toast.success("Đã cập nhật"); }
    else { addVoucher(form); toast.success("Đã thêm"); }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-3xl font-bold">Khuyến mãi</h1><p className="text-muted-foreground">Quản lý mã giảm giá</p></div>
        <Button onClick={openNew}><Plus className="mr-1 h-4 w-4" />Thêm voucher</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vouchers.map((v) => (
          <div key={v.id} className="rounded-xl border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="font-display text-xl font-bold text-primary">{v.code}</div>
              <Badge variant={v.active ? "default" : "secondary"}>{v.active ? "Đang dùng" : "Tạm tắt"}</Badge>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{v.description}</div>
            <div className="mt-3 text-sm">Giảm: <b>{v.type === "percent" ? `${v.value}%` : `${v.value.toLocaleString("vi-VN")}đ`}</b></div>
            <div className="text-xs text-muted-foreground">Hết hạn: {formatDate(v.expiresAt)}</div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(v)}><Pencil className="mr-1 h-3.5 w-3.5" />Sửa</Button>
              <Button size="sm" variant="ghost" onClick={() => { if (confirm("Xoá?")) { deleteVoucher(v.id); toast.success("Đã xoá"); } }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Sửa" : "Thêm"} voucher</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label>Mã</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} /></div>
            <div><Label>Loại</Label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "percent" | "fixed" })} className="h-10 w-full rounded-md border bg-background px-3">
                <option value="percent">Phần trăm</option>
                <option value="fixed">Số tiền cố định</option>
              </select>
            </div>
            <div><Label>Giá trị</Label><Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: +e.target.value })} /></div>
            <div><Label>Đơn tối thiểu</Label><Input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: +e.target.value })} /></div>
            <div><Label>Hết hạn</Label><Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} /></div>
            <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />Kích hoạt</label></div>
            <div className="sm:col-span-2"><Label>Mô tả</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Huỷ</Button><Button onClick={save}>Lưu</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
