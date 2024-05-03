package PecticeBD.Controllers;

import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@Setter
@Getter
public class MainController {

    public MainController() {}

    @GetMapping("/allocation")
    public String showAllocation(Model model) {
        return "AllocationForm.html";
    }

    @GetMapping("/classroom")
    public String showClassroom(Model model) {
        return "ClassroomForm.html";
    }

    @GetMapping("/equipment")
    public String showEquipment(Model model) {
        return "EquipmentForm.html";
    }

    @GetMapping("/equipmentType")
    public String showEquipmentType(Model model) {
        return "EquipmentTypeForm.html";
    }

    @GetMapping("/seat")
    public String showSeat(Model model) {
        return "SeatForm.html";
    }

    @GetMapping("/service")
    public String showService(Model model) {
        return "ServiceForm.html";
    }

}
