import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';
import { faker } from '@faker-js/faker';

async function seedUsers() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  for (let i = 0; i < 300; i++) {
    const user = {
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      username: faker.internet.userName(),
      password: 'Password123!',
      isActive: true,
      permissions: [],
      roleIds: [],
    };

    await userService.create(user);
    console.log(`Created user ${i + 1}/300: ${user.email}`);
  }

  await app.close();
  process.exit(0);
}

seedUsers().catch((err) => {
  console.error('Error seeding users:', err);
  process.exit(1);
});
