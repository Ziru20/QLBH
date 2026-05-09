const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.voucher.deleteMany();

  const u1 = await prisma.user.create({ data: { email: 'admin@shop.vn', password: 'admin123', fullName: 'Admin', role: 'admin' } });
  const u2 = await prisma.user.create({ data: { email: 'staff@shop.vn', password: 'staff123', fullName: 'Staff', role: 'staff' } });
  const u3 = await prisma.user.create({ data: { email: 'customer@shop.vn', password: '123456', fullName: 'Nguyễn Văn An', role: 'customer' } });

  const c1 = await prisma.category.create({ data: { name: 'Thời trang', slug: 'thoi-trang' } });
  const c2 = await prisma.category.create({ data: { name: 'Nhà bếp', slug: 'nha-bep' } });
  const c3 = await prisma.category.create({ data: { name: 'Điện tử', slug: 'dien-tu' } });
  const c4 = await prisma.category.create({ data: { name: 'Thể thao', slug: 'the-thao' } });
  const c5 = await prisma.category.create({ data: { name: 'Nội thất', slug: 'noi-that' } });
  const c6 = await prisma.category.create({ data: { name: 'Đồ chơi', slug: 'do-choi' } });
  const c7 = await prisma.category.create({ data: { name: 'Sách', slug: 'sach' } });

  const p1 = await prisma.product.create({ data: { name: 'Áo thun cotton premium', slug: 'ao-thun', categoryId: c1.id, price: 199000, stock: 20, image: 'https://via.placeholder.com/800x600?text=Ao+thun', description: 'Áo thun thoáng mát' } });
  const p2 = await prisma.product.create({ data: { name: 'Nồi inox', slug: 'noi-inox', categoryId: c2.id, price: 499000, stock: 10, image: 'https://via.placeholder.com/800x600?text=Noi', description: 'Nồi chất lượng' } });
  const p3 = await prisma.product.create({ data: { name: 'Tai nghe Bluetooth X200', slug: 'tai-nghe-bluetooth-x200', categoryId: c3.id, price: 899000, stock: 42, image: 'https://via.placeholder.com/800x600?text=Tai+nghe', description: 'Tai nghe không dây, chống ồn' } });
  const p4 = await prisma.product.create({ data: { name: 'Ghế văn phòng Ergo', slug: 'ghe-van-phong-ergo', categoryId: c5.id, price: 2190000, stock: 12, image: 'https://via.placeholder.com/800x600?text=Ghe+Ergo', description: 'Ghế công thái học thoải mái' } });
  const p5 = await prisma.product.create({ data: { name: 'Bóng đá chính hãng', slug: 'bong-da', categoryId: c4.id, price: 299000, stock: 60, image: 'https://via.placeholder.com/800x600?text=Bong+da', description: 'Bóng thi đấu sân cỏ' } });
  const p6 = await prisma.product.create({ data: { name: 'Đồ chơi xếp hình 1000 mảnh', slug: 'do-choi-xep-hinh', categoryId: c6.id, price: 349000, stock: 48, image: 'https://via.placeholder.com/800x600?text=Puzzle', description: 'Bộ xếp hình 1000 mảnh' } });
  const p7 = await prisma.product.create({ data: { name: 'Tiểu thuyết bán chạy', slug: 'tieu-thuyet-ban-chay', categoryId: c7.id, price: 129000, stock: 120, image: 'https://via.placeholder.com/800x600?text=Book', description: 'Tiểu thuyết lôi cuốn' } });

  await prisma.voucher.create({ data: { code: 'WELCOME10', description: 'Giảm 10%', type: 'percent', value: 10, minOrder: 0, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), active: true } });

  await prisma.review.create({ data: { productId: p1.id, userId: u3.id, userName: u3.fullName, rating: 5, comment: 'Áo đẹp!' } });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
