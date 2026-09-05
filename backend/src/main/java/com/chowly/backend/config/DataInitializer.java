package com.chowly.backend.config;

import com.chowly.backend.entity.Bartender;
import com.chowly.backend.entity.Chef;
import com.chowly.backend.entity.MenuItem;
import com.chowly.backend.entity.Table;
import com.chowly.backend.entity.Waiter;
import com.chowly.backend.enums.MenuItemType;
import com.chowly.backend.repository.BartenderRepository;
import com.chowly.backend.repository.ChefRepository;
import com.chowly.backend.repository.MenuItemRepository;
import com.chowly.backend.repository.TableRepository;
import com.chowly.backend.repository.WaiterRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    private final MenuItemRepository menuItemRepository;
    private final TableRepository tableRepository;
    private final WaiterRepository waiterRepository;
    private final ChefRepository chefRepository;
    private final BartenderRepository bartenderRepository;

    public DataInitializer(
            MenuItemRepository menuItemRepository,
            TableRepository tableRepository,
            WaiterRepository waiterRepository,
            ChefRepository chefRepository,
            BartenderRepository bartenderRepository) {

        this.menuItemRepository = menuItemRepository;
        this.tableRepository = tableRepository;
        this.waiterRepository = waiterRepository;
        this.chefRepository = chefRepository;
        this.bartenderRepository = bartenderRepository;
    }

    @Override
    public void run(String... args) {

        seedMenuItems();
        seedTables();
        seedWaiters();
        seedChefs();
        seedBartenders();
    }

    private void seedMenuItems() {

        addMenuItem(
                "Jollof Rice",
                MenuItemType.FOOD,
                "3500.00",
                20
        );

        addMenuItem(
                "Grilled Chicken",
                MenuItemType.FOOD,
                "4500.00",
                25
        );

        addMenuItem(
                "Beef Burger",
                MenuItemType.FOOD,
                "5000.00",
                15
        );

        addMenuItem(
                "Pasta Alfredo",
                MenuItemType.FOOD,
                "4000.00",
                18
        );

        addMenuItem(
                "Fresh Orange Juice",
                MenuItemType.DRINK,
                "2000.00",
                5
        );

        addMenuItem(
                "Mango Smoothie",
                MenuItemType.DRINK,
                "2500.00",
                7
        );

        addMenuItem(
                "Soft Drink",
                MenuItemType.DRINK,
                "1000.00",
                2
        );

        addMenuItem(
                "Fried Rice",
                MenuItemType.FOOD,
                "3500.00",
                20
        );

        addMenuItem(
                "Jollof Rice & Grilled Chicken",
                MenuItemType.FOOD,
                "7000.00",
                25
        );

        addMenuItem(
                "Fried Rice & Grilled Chicken",
                MenuItemType.FOOD,
                "7000.00",
                25
        );

        addMenuItem(
                "Eba & Efo Riro",
                MenuItemType.FOOD,
                "4000.00",
                20
        );

        addMenuItem(
                "Ofada Rice & Sauce",
                MenuItemType.FOOD,
                "4500.00",
                22
        );

        addMenuItem(
                "Spaghetti Bolognese",
                MenuItemType.FOOD,
                "4500.00",
                20
        );

        addMenuItem(
                "Stir-Fried Spaghetti",
                MenuItemType.FOOD,
                "4000.00",
                18
        );

        addMenuItem(
                "Creamy Chicken Pasta",
                MenuItemType.FOOD,
                "5000.00",
                22
        );

        addMenuItem(
                "Chicken Burger",
                MenuItemType.FOOD,
                "5000.00",
                15
        );

        addMenuItem(
                "Grilled Fish",
                MenuItemType.FOOD,
                "6500.00",
                25
        );

        addMenuItem(
                "Chicken Wings",
                MenuItemType.FOOD,
                "4500.00",
                20
        );

        addMenuItem(
                "French Fries",
                MenuItemType.FOOD,
                "2500.00",
                10
        );

        addMenuItem(
                "Fried Plantain",
                MenuItemType.FOOD,
                "2000.00",
                10
        );

        addMenuItem(
                "Coleslaw",
                MenuItemType.FOOD,
                "1500.00",
                5
        );

        addMenuItem(
                "Pepper Sauce",
                MenuItemType.FOOD,
                "1000.00",
                5
        );

        addMenuItem(
                "Pineapple Juice",
                MenuItemType.DRINK,
                "2000.00",
                5
        );

        addMenuItem(
                "Chapman",
                MenuItemType.DRINK,
                "2500.00",
                7
        );

        addMenuItem(
                "Bottled Water",
                MenuItemType.DRINK,
                "500.00",
                2
        );
    }

    private void addMenuItem(
            String name,
            MenuItemType type,
            String price,
            int preparationTime) {

        if (menuItemRepository.existsByName(name)) {
            return;
        }

        menuItemRepository.save(
                new MenuItem(
                        name,
                        type,
                        new BigDecimal(price),
                        true,
                        preparationTime
                )
        );
    }

    private void seedTables() {

        if (tableRepository.count() > 0) {
            return;
        }

        tableRepository.save(new Table(1, 2));
        tableRepository.save(new Table(2, 2));
        tableRepository.save(new Table(3, 4));
        tableRepository.save(new Table(4, 6));
        tableRepository.save(new Table(5, 8));
    }

    private void seedWaiters() {

        if (waiterRepository.count() > 0) {
            return;
        }

        waiterRepository.save(new Waiter("Daniel"));
        waiterRepository.save(new Waiter("Sarah"));
    }

    private void seedChefs() {

        if (chefRepository.count() > 0) {
            return;
        }

        chefRepository.save(new Chef("Michael"));
        chefRepository.save(new Chef("Chidi"));
    }

    private void seedBartenders() {

        if (bartenderRepository.count() > 0) {
            return;
        }

        bartenderRepository.save(new Bartender("James"));
        bartenderRepository.save(new Bartender("Amaka"));
    }
}
