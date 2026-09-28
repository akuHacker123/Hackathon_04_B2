-- Add monthly budgets without changing or replacing existing tables or rows.
CREATE TABLE "monthly_budgets" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "month" DATE NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_budgets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "monthly_budgets_amount_positive_check" CHECK ("amount" > 0),
    CONSTRAINT "monthly_budgets_month_start_check" CHECK (EXTRACT(DAY FROM "month") = 1),
    CONSTRAINT "monthly_budgets_user_id_month_key" UNIQUE ("user_id", "month"),
    CONSTRAINT "monthly_budgets_user_id_fkey" FOREIGN KEY ("user_id")
        REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
