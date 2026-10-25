// scripts/clear-marketplace-data.ts
// Jalanin: npx tsx scripts/clear-marketplace-data.ts
// Habis dipakai, boleh dihapus filenya.

import { prisma } from '@/lib/prisma';

async function main() {
  // Order duluan (OrderItem ikut kehapus otomatis karena cascade)
  const deletedOrders = await prisma.order.deleteMany();
  console.log(`Terhapus ${deletedOrders.count} order (+ semua item-nya)`);

  // Product (Variant & ProductImage ikut kehapus otomatis karena cascade)
  const deletedProducts = await prisma.product.deleteMany();
  console.log(`Terhapus ${deletedProducts.count} produk (+ semua varian & gambar-nya)`);

  console.log('Selesai! Data marketplace udah bersih.');
}

main()
  .catch((error) => {
    console.error('Gagal:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
