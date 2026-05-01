import { pgTable, serial, text, timestamp, date, time, bigint, uuid } from 'drizzle-orm/pg-core';

// 1. Catálogo de Plantas
export const plantsCatalog = pgTable('plants_catalog', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  nameEn: text('name_en').notNull(),
  nameEs: text('name_es').notNull(),
  careLevel: text('care_level'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 2. Citas (Appointments)
export const appointments = pgTable('appointments', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  serviceType: text('service_type').notNull(),
  appointmentDate: date('appointment_date'),
  appointmentTime: time('appointment_time'),
  fullName: text('full_name').notNull(),
  city: text('city').default('Lakeland'),
  zipCode: text('zip_code'),
  addressLine1: text('address_line1'),
  addressLine2: text('address_line2'),
  status: text('status').default('pending'),
  phone: text('phone'),
  email: text('email'),
  // Nota: Aquí guardaremos el ID que nos dé Clerk (es un string, no un UUID)
  userId: text('user_id'), 
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 3. Items de la Cita (Relación entre Citas y Plantas)
export const appointmentItems = pgTable('appointment_items', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  appointmentId: bigint('appointment_id', { mode: 'number' }).references(() => appointments.id),
  plantId: bigint('plant_id', { mode: 'number' }).references(() => plantsCatalog.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 4. Mensajes de Contacto
export const contactMessages = pgTable('contact_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});