from django.shortcuts import render_to_response, render
from django.template import RequestContext
from django.http import HttpResponseRedirect
from spacescout_web.forms.contact import ContactForm
from django.core.mail import send_mail
from django.conf import settings

def ContactView(request):
    back = '/'
    if request.MOBILE == 1:
        is_mobile = True
    else:
        is_mobile = False
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            name = form.cleaned_data['name']
            sender = form.cleaned_data['sender']
            message = form.cleaned_data['message']
            #feedback_choice = form.cleaned_data['feedback_choice']
            feedback_choice = 'problem'
            bot_test = form.cleaned_data['email_confirmation']

            if 'spot_id' in request.session:
                spot_id = request.session['spot_id']
            else:
                spot_id = 'Unknown'

            if 'spot_name' in request.session:
                spot_name = request.session['spot_name']
            else:
                spot_name = 'Unknown'

            browser = request.META.get('HTTP_USER_AGENT', 'Unknown')
            subject = "SpaceScout %s from %s" %(feedback_choice, name)
            email_message = "SpaceScout Web - %s \n\n %s \n\n %s %s \n %s - ID = %s \
                \n Browser Type = %s" %(feedback_choice, message, name, sender, spot_name, spot_id, browser)

            if bot_test == '':
                try:
                    send_mail(subject, email_message, sender, settings.FEEDBACK_EMAIL_RECIPIENT)
                except Exception as e:
                    if e.errno == 61:
                        return HttpResponseRedirect('/contact/sorry/')

            #if is_mobile and spot_id != 'Unknown':
                #return HttpResponseRedirect('/space/' + spot_id)
            #else:
                #return HttpResponseRedirect('/')
            return HttpResponseRedirect('/contact/thankyou/')
    else:
        form = ContactForm()

     # See if django-compressor is being used to precompile less
    if settings.COMPRESS_ENABLED:
        less_not_compiled = False
    else:
        less_not_compiled = True

    return render_to_response('contact.html', {
        'form': form,
        'is_mobile': is_mobile,
        'less_not_compiled': less_not_compiled,
    }, context_instance=RequestContext(request))

def ThankYouView(request):
    back = '/'
    return render(request, 'thankyou.html')

def SorryView(request):
    back = '/'
    email = settings.FEEDBACK_EMAIL_RECIPIENT
    return render(request, 'sorry.html')
