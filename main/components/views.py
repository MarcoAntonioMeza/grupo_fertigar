from django.views.generic.base import TemplateView


class ComponentView(TemplateView):
    pass


# Base Ui
accordions_view = ComponentView.as_view(template_name="components/ui-kit/accordions.html")
alerts_view = ComponentView.as_view(template_name="components/ui-kit/alerts.html")
avatars_view = ComponentView.as_view(template_name="components/ui-kit/avatar.html")
badges_view = ComponentView.as_view(template_name="components/ui-kit/badges.html")
breadcrumb_view = ComponentView.as_view(template_name="components/ui-kit/breadcrumb.html")
buttons_view = ComponentView.as_view(template_name="components/ui-kit/buttons.html")
cards_view = ComponentView.as_view(template_name="components/ui-kit/cards.html")
carousel_view = ComponentView.as_view(template_name="components/ui-kit/carousel.html")
collapse_view = ComponentView.as_view(template_name="components/ui-kit/collapse.html")
dropdowns_view = ComponentView.as_view(template_name="components/ui-kit/dropdowns.html")
embed_video_view = ComponentView.as_view(template_name="components/ui-kit/embed-video.html")
grid_view = ComponentView.as_view(template_name="components/ui-kit/grid.html")
list_group_view = ComponentView.as_view(template_name="components/ui-kit/list-group.html")
modals_view = ComponentView.as_view(template_name="components/ui-kit/modals.html")
notifications_view = ComponentView.as_view(template_name="components/ui-kit/tost.html")
offcanvas_view = ComponentView.as_view(template_name="components/ui-kit/offcanvas.html")
placeholder_view = ComponentView.as_view(template_name="components/ui-kit/placeholder.html")
pagination_view = ComponentView.as_view(template_name="components/ui-kit/pagination.html")
popovers_view = ComponentView.as_view(template_name="components/ui-kit/popover.html")
progress_view = ComponentView.as_view(template_name="components/ui-kit/progress.html")
spinners_view = ComponentView.as_view(template_name="components/ui-kit/spinners.html")
tabs_view = ComponentView.as_view(template_name="components/ui-kit/tabs.html")
tooltips_view = ComponentView.as_view(template_name="components/ui-kit/tooltips.html")
typography_view = ComponentView.as_view(template_name="components/ui-kit/typography.html")

#Extended UI
nestable_view = ComponentView.as_view(template_name="components/extended-ui/nestable-list.html")
range_slider_view = ComponentView.as_view(template_name="components/extended-ui/range-slider.html")
tour_view = ComponentView.as_view(template_name="components/extended-ui/tour-page.html")
scrollbar_view = ComponentView.as_view(template_name="components/extended-ui/scrollbar.html")
scrollspy_view = ComponentView.as_view(template_name="components/extended-ui/scrollspy.html")
sweet_alert_view = ComponentView.as_view(template_name="components/extended-ui/sweet-alert.html")

#Widgets
widgets_view = ComponentView.as_view(template_name="components/widgets/widgets.html")

#Icons
two_tones_view = ComponentView.as_view(template_name="components/icons/two-tones.html")
colored_view = ComponentView.as_view(template_name="components/icons/colored.html")
feather_view = ComponentView.as_view(template_name="components/icons/feather.html")
mdi_view = ComponentView.as_view(template_name="components/icons/material-design.html")
dripicons_view = ComponentView.as_view(template_name="components/icons/dripicons.html")
font_awesome_view = ComponentView.as_view(template_name="components/icons/font-awesome.html")
remixicons_view = ComponentView.as_view(template_name="components/icons/remixicons.html")
unicons_view = ComponentView.as_view(template_name="components/icons/unicons.html")

#Chartjs
apex_view = ComponentView.as_view(template_name="components/chartjs/apex-charts.html")
flot_view  = ComponentView.as_view(template_name="components/chartjs/flot.html")
morris_view = ComponentView.as_view(template_name="components/chartjs/morris.html")
chartjs_view = ComponentView.as_view(template_name="components/chartjs/chartjs.html")
peity_view = ComponentView.as_view(template_name="components/chartjs/peity.html")
chartist_view = ComponentView.as_view(template_name="components/chartjs/chartist.html")
c3_view = ComponentView.as_view(template_name="components/chartjs/c3.html")
sparklines_view = ComponentView.as_view(template_name="components/chartjs/sparklines.html")
jquery_knob_view = ComponentView.as_view(template_name="components/chartjs/jquery-knob.html")

#Forms
elements_view = ComponentView.as_view(template_name="components/forms/elements.html")
advanced_view = ComponentView.as_view(template_name="components/forms/advanced.html")
validation_view = ComponentView.as_view(template_name="components/forms/validation.html")
pickers_view = ComponentView.as_view(template_name="components/forms/pickers.html")
wizard_view = ComponentView.as_view(template_name="components/forms/wizard.html")
masks_view = ComponentView.as_view(template_name="components/forms/masks.html")
file_uploads_view = ComponentView.as_view(template_name="components/forms/file-uploads.html")
editors_view = ComponentView.as_view(template_name="components/forms/editors.html")

#Tables
basic_view = ComponentView.as_view(template_name="components/tables/basic.html")
datatables_view = ComponentView.as_view(template_name="components/tables/datatables.html")
editable_view = ComponentView.as_view(template_name="components/tables/editable.html")
responsive_view = ComponentView.as_view(template_name="components/tables/responsive.html")
tablesaw_view = ComponentView.as_view(template_name="components/tables/tablesaw.html")

#Maps
google_view = ComponentView.as_view(template_name="components/maps/google.html")
vector_view = ComponentView.as_view(template_name="components/maps/vector.html")
mapael_view = ComponentView.as_view(template_name="components/maps/mapael.html")