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

        if (menuItemRepository.count() > 0) {
            return;
        }

        menuItemRepository.save(
                new MenuItem(
                        "Jollof Rice",
                        MenuItemType.FOOD,
                        new BigDecimal("3500.00"),
                        true,
                        20
                )
        );

        menuItemRepository.save(
                new MenuItem(
                        "Grilled Chicken",
                        MenuItemType.FOOD,
                        new BigDecimal("4500.00"),
                        true,
                        25
                )
        );

        menuItemRepository.save(
                new MenuItem(
                        "Beef Burger",
                        MenuItemType.FOOD,
                        new BigDecimal("5000.00"),
                        true,
                        15
                )
        );

        menuItemRepository.save(
                new MenuItem(
                        "Pasta Alfredo",
                        MenuItemType.FOOD,
                        new BigDecimal("4000.00"),
                        true,
                        18
                )
        );

        menuItemRepository.save(
                new MenuItem(
                        "Fresh Orange Juice",
                        MenuItemType.DRINK,
                        new BigDecimal("2000.00"),
                        true,
                        5
                )
        );

        menuItemRepository.save(
                new MenuItem(
                        "Mango Smoothie",
                        MenuItemType.DRINK,
                        new BigDecimal("2500.00"),
                        true,
                        7
                )
        );

        menuItemRepository.save(
                new MenuItem(
                        "Soft Drink",
                        MenuItemType.DRINK,
                        new BigDecimal("1000.00"),
                        true,
                        2
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
