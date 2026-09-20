// Styles
import styles from "./ProductDataTable.module.css";
// React
import { useMemo, useState } from "react";
// Icons
import { Pencil, Trash } from "lucide-react";
// Hooks
import { useDeleteProduct } from "../../../core/hooks/useProducts";
// Types
import type { Product } from "../../../core/schemas/product.schema";
import type { ColumnDef } from "../../../shared/components/table/Table";
// Components
import { Button } from "../../../shared/components/button/Button";
import { Table } from "../../../shared/components/table/Table";
import { Alert } from "../../../shared/components/alert/Alert";
// Utils
import { currencyFormatter } from "../../../core/utils/currency";

interface ProductDataTableProps {
  products: Product[];
}

export function ProductDataTable({ products }: ProductDataTableProps) {
  const deleteProduct = useDeleteProduct();

  function handleConfirmDelete(): void {
    if (productToDelete) {
      deleteProduct.mutate(productToDelete.id, {
        onSuccess: () => setProductToDelete(null),
      });
    }
  }
  const [productToDelete, setProductToDelete] = useState<Product | null>(
    null,
  );
  function handleDeleteRequest(product: Product): void {
    setProductToDelete(product);
  }

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        key: "name",
        header: "Produto",

        render: (product) => (
          <>
            <strong className={styles["product-table__product-name"]}>
              {product.name}
            </strong>
            <span className={styles["product-table__product-description"]}>
              {product.description}
            </span>
          </>
        ),
      },
      {
        key: "price",
        header: "Preço (UN.)",
        align: "center",
        render: (product) => (
          <span className={styles["product-table__price"]}>
            {currencyFormatter.format(product.price)}
          </span>
        ),
      },
      {
        key: "stockQuantity",
        header: "Estoque",
        align: "center",
        render: (product) => (
          <span className={styles["product-table__stock"]}>
            {product.stockQuantity}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Ações",
        align: "center",
        render: (product) => (
          <div className={styles["product-table__row-actions"]}>
            <Button
              type="button"
              icon={<Pencil aria-hidden="true" size={17} />}
              ariaLabel="Atualizar produto"
              mode="clean"
              variant="light"
              to={`/products/${product.id}/edit`}
            />
            <Button
              type="button"
              icon={<Trash aria-hidden="true" size={17} />}
              ariaLabel="Excluir produto"
              mode="clean"
              variant="danger"
              onClick={() => handleDeleteRequest(product)}
              disabled={
                deleteProduct.isPending &&
                deleteProduct.variables === product.id
              }
            />
          </div>
        ),
      },
    ],
    [deleteProduct.isPending, deleteProduct.variables],
  );

  return (
    <>
      <div className={styles["product-table__wrap"]}>
        <Table
          columns={columns}
          data={products}
          rowKey={(product) => product.id}
        />
      </div>

      <Alert
        type="danger"
        isOpen={!!productToDelete}
        title="Excluir produto"
        description={`Tem certeza que deseja excluir o produto "${productToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setProductToDelete(null)}
        isLoading={deleteProduct.isPending}
      />
    </>
  );
}
