CREATE TYPE "public"."gender_enum" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."role_enum" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TYPE "public"."year_enum" AS ENUM('1st_year', '2nd_year', '3rd_year', '4th_year', '5th_year', '6th_year', '7th_year', '8th_year', '9th_year', '10th_year', '11th_year');--> statement-breakpoint
CREATE TABLE "contact" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"phone_number" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"campus" varchar(255) NOT NULL,
	"major" varchar(255) NOT NULL,
	"year" "year_enum" NOT NULL,
	"is_interested" boolean NOT NULL,
	"gender" "gender_enum" NOT NULL,
	"follow_up_status" integer
);
--> statement-breakpoint
CREATE TABLE "follow_up_status" (
	"number" integer PRIMARY KEY NOT NULL,
	"description" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "role_enum" NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"contact" uuid
);
--> statement-breakpoint
ALTER TABLE "contact" ADD CONSTRAINT "contact_follow_up_status_follow_up_status_number_fk" FOREIGN KEY ("follow_up_status") REFERENCES "public"."follow_up_status"("number") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_contact_contact_id_fk" FOREIGN KEY ("contact") REFERENCES "public"."contact"("id") ON DELETE no action ON UPDATE no action;